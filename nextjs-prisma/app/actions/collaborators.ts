"use server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import type { AddCollaboratorInput, UpdateCollaboratorInput } from "@/types/collaborator"

/**
 * Add collaborator to document
 * Only owner can add
 */
export async function addCollaborator(
  docId: string,
  input: AddCollaboratorInput
) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    const permission = await getDocumentPermission(docId)

    if (permission !== "owner") {
      throw new Error("Only document owner can add collaborators")
    }

    if (!input.email || !input.role) {
      throw new Error("Email and role are required")
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw new Error(`User with email ${input.email} not found`)
    }

    // Get document
    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: { ownerId: true },
    })

    if (user.id === doc?.ownerId) {
      throw new Error("Cannot add document owner as collaborator")
    }

    // Check if already exists
    const existing = await prisma.collaborator.findUnique({
      where: {
        docId_userId: { docId, userId: user.id },
      },
    })

    if (existing) {
      throw new Error("User is already a collaborator")
    }

    // Create collaborator
    const collaborator = await prisma.collaborator.create({
      data: {
        docId,
        userId: user.id,
        role: input.role as "OWNER" | "EDITOR" | "VIEWER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    console.log(`[Action] Collaborator added: ${input.email}`)

    return {
      success: true,
      collaborator,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add collaborator"
    console.error("[Action Error] addCollaborator:", message)
    throw new Error(message)
  }
}

/**
 * Get all collaborators for a document
 */
export async function getCollaborators(docId: string) {
  try {
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        ownerId: true,
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { addedAt: "asc" },
        },
      },
    })

    const owner = await prisma.user.findUnique({
      where: { id: document?.ownerId },
      select: { id: true, name: true, email: true, image: true },
    })

    const collaborators = [
      {
        id: `owner-${document?.ownerId}`,
        userId: document?.ownerId,
        role: "OWNER" as const,
        user: owner,
      },
      ...document?.collaborators || [],
    ]

    return {
      success: true,
      collaborators,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch collaborators"
    console.error("[Action Error] getCollaborators:", message)
    throw new Error(message)
  }
}

/**
 * Update collaborator role
 * Only owner can update
 */
export async function updateCollaboratorRole(
  docId: string,
  userId: string,
  input: UpdateCollaboratorInput
) {
  try {
    const permission = await getDocumentPermission(docId)

    if (permission !== "owner") {
      throw new Error("Only document owner can update roles")
    }

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: { ownerId: true },
    })

    if (userId === doc?.ownerId) {
      throw new Error("Cannot change document owner's role")
    }

    const collaborator = await prisma.collaborator.update({
      where: {
        docId_userId: { docId, userId },
      },
      data: {
        role: input.role as "OWNER" | "EDITOR" | "VIEWER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    console.log(`[Action] Role updated: ${userId} → ${input.role}`)

    return {
      success: true,
      collaborator,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role"
    console.error("[Action Error] updateCollaboratorRole:", message)
    throw new Error(message)
  }
}

/**
 * Remove collaborator from document
 * Only owner can remove
 */
export async function removeCollaborator(docId: string, userId: string) {
  try {
    const permission = await getDocumentPermission(docId)

    if (permission !== "owner") {
      throw new Error("Only document owner can remove collaborators")
    }

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: { ownerId: true },
    })

    if (userId === doc?.ownerId) {
      throw new Error("Cannot remove document owner")
    }

    await prisma.collaborator.delete({
      where: {
        docId_userId: { docId, userId },
      },
    })

    console.log(`[Action] Collaborator removed: ${userId}`)

    return {
      success: true,
      message: "Collaborator removed",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove collaborator"
    console.error("[Action Error] removeCollaborator:", message)
    throw new Error(message)
  }
}

/**
 * Search for users by email
 */
export async function searchUsers(docId: string, query: string) {
  try {
    const permission = await getDocumentPermission(docId)

    if (permission !== "owner") {
      throw new Error("Only document owner can search for users")
    }

    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters")
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: query.toLowerCase(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10,
    })

    return {
      success: true,
      users,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed"
    console.error("[Action Error] searchUsers:", message)
    throw new Error(message)
  }
}