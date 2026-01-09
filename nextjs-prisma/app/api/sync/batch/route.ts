import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser ,  getDocumentPermission } from "@/lib/auth/permission"
import type { BatchSyncRequest } from "@/types/sync"
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser()
    const body = await request.json() as BatchSyncRequest

    // Validate input
    if (!Array.isArray(body.operations) || body.operations.length === 0) {
      return NextResponse.json(
        { error: "Invalid operations array" },
        { status: 400 }
      )
    }

    if (body.operations.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 operations per batch" },
        { status: 400 }
      )
    }

    const queuedOps = []
    const errors = []

    for (const op of body.operations) {
      try {
        // Validate
        if (!op.docId || !op.operation) {
          errors.push({ docId: op.docId, error: "Missing docId or operation" })
          continue
        }

        const permission = await getDocumentPermission(op.docId)
        if (permission === "none") {
          errors.push({ docId: op.docId, error: "Access denied" })
          continue
        }

        const syncOp = await prisma.syncQueue.create({
          data: {
            userId,
            docId: op.docId,
            operation: op.operation,
            payload: op.payload,
            status: "PENDING",
          },
        })

        queuedOps.push(syncOp)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Queue failed"
        errors.push({ docId: op.docId, error: message })
      }
    }

    console.log(
      `[API] Batch sync: ${queuedOps.length} queued, ${errors.length} errors`
    )

    return NextResponse.json(
      {
        success: true,
        queued: queuedOps.length,
        errors,
        message: `${queuedOps.length} operations queued`,
      },
      { status: 202 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch sync failed"
    console.error("[API Error] POST /sync/batch:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}