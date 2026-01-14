// app/actions/collaborators.ts

"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import type { AddCollaboratorInput } from "@/types/collaborator"

/**
 * Add collaborator to document
 */
export async function addCollaborator(
  docId: string,
  input: AddCollaboratorInput
) {
  try {
    const userId = await getCurrentUser()
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
    const message = error instanceof Error ? error.message : "Failed to add"
    console.error("[Action Error] addCollaborator:", message)
    throw new Error(message)
  }
}

/**
 * Search for users by email
 */
export async function searchUsers(docId: string, query: string) {
  try {
    const userId = await getCurrentUser()
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