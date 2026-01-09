"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import { SyncProcessor } from "@/lib/sync/sync_processor"
import type { SyncOperation } from "@/types/sync"

export async function submitSyncOperation(operation: SyncOperation) {
  try {
    const userId = await getCurrentUser()
    const permission = await getDocumentPermission(operation.docId)

    if (permission === "none") {
      throw new Error("Access denied to this document")
    }

    const syncOp = await prisma.syncQueue.create({
      data: {
        userId,
        docId: operation.docId,
        operation: operation.operation,
        payload: operation.payload,
        status: "PENDING",
      },
    })

    return {
      success: true,
      id: syncOp.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed"
    console.error("[Action Error] submitSyncOperation:", message)
    throw new Error(message)
  }
}
export async function getSyncStatus(docId: string) {
  try {
    const userId = await getCurrentUser()
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    const operations = await prisma.syncQueue.findMany({
      where: { docId, userId },
      orderBy: { createdAt: "asc" },
    })

    const pendingCount = operations.filter(
      (op) => op.status === "PENDING"
    ).length

    return {
      success: true,
      docId,
      pendingCount,
      operations,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get status"
    console.error("[Action Error] getSyncStatus:", message)
    throw new Error(message)
  }
}
export async function triggerSync() {
  try {
    const syncedCount = await SyncProcessor.processPendingQueue()

    return {
      success: true,
      syncedCount,
      message: `${syncedCount} operations synced`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed"
    console.error("[Action Error] triggerSync:", message)
    throw new Error(message)
  }
}