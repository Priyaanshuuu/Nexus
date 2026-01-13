// app/actions/yjs.ts

"use server"

import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import { YjsDocumentManager } from "@/lib/yjs/document_manager"
import { UpdateHandler } from "@/lib/yjs/update_handler"
/**
 * Get document Yjs state
 * Used by frontend when opening editor
 */
export async function getDocumentState(docId: string) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    const ydoc = await YjsDocumentManager.getDocumentState(docId)
    const state = YjsDocumentManager.encodeState(ydoc)
    const stateBase64 = Buffer.from(state).toString("base64")

    return {
      success: true,
      docId,
      state: stateBase64,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get state"
    console.error("[Action Error] getDocumentState:", message)
    throw new Error(message)
  }
}

/**
 * Apply update to document
 * Called when user edits content
 */
export async function applyDocumentUpdate(
  docId: string,
  update: string,
  clientVersion: number
) {
  try {
    const userId = await getCurrentUser()
    const permission = await getDocumentPermission(docId)

    if (permission !== "editor" && permission !== "owner") {
      throw new Error("You don't have permission to edit")
    }

    // Decode update
    const updateBuffer = Buffer.from(update, "base64")

    // Apply update
    const result = await UpdateHandler.applyClientUpdate(
      docId,
      updateBuffer,
      clientVersion,
      userId
    )

    if (!result.success) {
      throw new Error(result.error || "Update failed")
    }

    return {
      success: true,
      newVersion: result.newVersion,
      content: result.content,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed"
    console.error("[Action Error] applyDocumentUpdate:", message)
    throw new Error(message)
  }
}

/**
 * Get incremental updates for syncing
 */
export async function getSyncUpdates(
  docId: string,
  stateVectorBase64: string
) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    // Decode state vector
    const stateVector = Buffer.from(stateVectorBase64, "base64")

    // Get sync updates
    const updates = await UpdateHandler.getSyncUpdates(docId, stateVector)
    const updatesBase64 = Buffer.from(updates).toString("base64")

    return {
      success: true,
      docId,
      updates: updatesBase64,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync"
    console.error("[Action Error] getSyncUpdates:", message)
    throw new Error(message)
  }
}

/**
 * Get document history
 */
export async function getDocumentHistory(docId: string) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    // In a real app, you'd query an audit log
    return {
      success: true,
      docId,
      history: [],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get history"
    console.error("[Action Error] getDocumentHistory:", message)
    throw new Error(message)
  }
}