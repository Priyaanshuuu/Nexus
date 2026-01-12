// app/actions/presence.ts

"use server"

import { generateLiveblockToken } from "@/lib/liveblocks"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import { prisma } from "@/lib/prisma"
import type { PresenceUpdate } from "@/types/presence"
export async function getLiveblocksToken() {
  try {
    const token = await generateLiveblockToken()

    return {
      success: true,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get token"
    console.error("[Action Error] getLiveblocksToken:", message)
    throw new Error(message)
  }
}

/**
 * Get active users in document
 */
export async function getActiveUsers(docId: string) {
  try {
    const userId = await getCurrentUser()
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        ownerId: true,
        collaborators: {
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
               // image: true,
              },
            },
          },
        },
      },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    const owner = await prisma.user.findUnique({
      where: { id: document.ownerId },
      select: {
        id: true,
        name: true,
        email: true,
       // image: true,
      },
    })

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
    ]

    const users = [
      {
        userId: owner!.id,
        name: owner!.name || "Owner",
        email: owner!.email,
       // image: owner!.image,
        role: "OWNER",
        color: colors[0],
        isCurrentUser: owner!.id === userId,
      },
      ...document.collaborators.map((collab, index) => ({
        userId: collab.userId,
        name: collab.user.name || "Collaborator",
        email: collab.user.email,
        //image: collab.user.image,
        role: collab.role,
        color: colors[(index + 1) % colors.length],
        isCurrentUser: collab.userId === userId,
      })),
    ]

    return {
      success: true,
      docId,
      users,
      count: users.length,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get users"
    console.error("[Action Error] getActiveUsers:", message)
    throw new Error(message)
  }
}

/**
 * Update user presence
 */
export async function updateUserPresence(
  docId: string,
  presence: PresenceUpdate
) {
  try {
    const userId = await getCurrentUser()
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    // Update device sync last seen
    await prisma.deviceSync.updateMany({
      where: { userId },
      data: {
        lastSeenOnline: new Date(),
        isOnline: true,
      },
    })

    console.log(`[Action] Presence updated: ${userId}`, presence)

    return {
      success: true,
      message: "Presence updated",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update presence"
    console.error("[Action Error] updateUserPresence:", message)
    throw new Error(message)
  }
}