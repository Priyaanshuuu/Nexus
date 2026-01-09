// lib/sync/sync-processor.ts

import { prisma } from "@/lib/prisma"
import { ConflictResolver } from "./conflict_resolver"
import { RetryStrategy } from "./retry_strategy"
import type { SyncOperationInput, SyncPayLoad } from "@/types/sync"

export class SyncProcessor {
  /**
   * Process a single sync operation
   * Handles CREATE, UPDATE, DELETE
   */
  static async processOperation(
    operation: SyncOperationInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (operation.operation) {
        case "CREATE":
          return await this.processCreate(operation)
        case "UPDATE":
          return await this.processUpdate(operation)
        case "DELETE":
          return await this.processDelete(operation)
        default:
          return { success: false, error: "Unknown operation" }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error(`[SyncProcessor] Error processing operation:`, message)
      return { success: false, error: message }
    }
  }

  /**
   * Process CREATE operation
   * Mark document as no longer local-only
   */
  private static async processCreate(
    operation: SyncOperationInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { docId, payload } = operation

      await prisma.document.update({
        where: { id: docId },
        data: {
          isLocalOnly: false,
          title: payload.title || "Untitled Document",
        },
      })

      console.log(`[SyncProcessor] CREATE processed: ${docId}`)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed"
      return { success: false, error: message }
    }
  }

  /**
   * Process UPDATE operation
   * Merge content with conflict resolution
   */
  private static async processUpdate(
    operation: SyncOperationInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { docId, payload } = operation

      // Get current document
      const doc = await prisma.document.findUnique({
        where: { id: docId },
        select: {
          content: true,
          version: true,
          yjsState: true,
        },
      })

      if (!doc) {
        return { success: false, error: "Document not found" }
      }

      // Resolve conflicts
      let finalContent = doc.content
      if (payload.content !== undefined) {
        // If we have Yjs update, merge it
        if (payload.yjsUpdate) {
          const buffer = Buffer.from(payload.yjsUpdate, "base64")
          const merged = ConflictResolver.mergeUpdates(
            doc.content,
            buffer
          )
          finalContent = merged.mergedContent
        } else {
          // No Yjs, use last-write-wins
          finalContent = payload.content
        }
      }

      // Update document
      await prisma.document.update({
        where: { id: docId },
        data: {
          content: finalContent,
          version: { increment: 1 },
          isLocalOnly: false,
          yjsState: payload.yjsState
            ? Buffer.from(payload.yjsState, "base64")
            : undefined,
        },
      })

      console.log(`[SyncProcessor] UPDATE processed: ${docId}`)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed"
      return { success: false, error: message }
    }
  }

  /**
   * Process DELETE operation
   */
  private static async processDelete(
    operation: SyncOperationInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { docId } = operation

      await prisma.document.delete({
        where: { id: docId },
      })

      console.log(`[SyncProcessor] DELETE processed: ${docId}`)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed"
      return { success: false, error: message }
    }
  }

  /**
   * Process all pending sync operations
   * Returns count of synced operations
   */
  static async processPendingQueue(): Promise<number> {
    try {
      // Get all PENDING operations
      const pending = await prisma.syncQueue.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 100, // Process in batches
      })

      let syncedCount = 0

      for (const syncOp of pending) {
        const result = await this.processOperation({
          userId: syncOp.userId,
          docId: syncOp.docId,
          operation: syncOp.operation as "CREATE" | "UPDATE" | "DELETE",
          payload: (syncOp.payload as SyncPayLoad) ?? {},
        })

        if (result.success) {
          // Mark as synced
          await prisma.syncQueue.update({
            where: { id: syncOp.id },
            data: {
              status: "SYNCED",
              syncedAt: new Date(),
            },
          })
          syncedCount++
        } else {
          // Mark as failed and increment retry count
          const retryInfo = RetryStrategy.getRetryInfo(syncOp.retries)

          if (retryInfo.shouldRetry) {
            // Keep as PENDING for next retry
            await prisma.syncQueue.update({
              where: { id: syncOp.id },
              data: {
                retries: { increment: 1 },
                error: result.error,
              },
            })
          } else {
            // Max retries exceeded, mark as FAILED
            await prisma.syncQueue.update({
              where: { id: syncOp.id },
              data: {
                status: "FAILED",
                error: `Max retries exceeded: ${result.error}`,
              },
            })
          }
        }
      }

      console.log(
        `[SyncProcessor] Processed queue: ${syncedCount}/${pending.length} synced`
      )
      return syncedCount
    } catch (error) {
      console.error("[SyncProcessor] Queue processing failed:", error)
      return 0
    }
  }
}