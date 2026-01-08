"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission  } from "@/lib/auth/permission"
import type { DocumentCreateInput, DocumentUpdateInput } from "@/types/document"
import { Prisma } from "../generated/prisma/client"

export async function createDocument(input: DocumentCreateInput) {
  try {
    const userId = await getCurrentUser()

    const title = input.title?.trim() || "Untitled Document"

    if (title.length > 255) {
      throw new Error("Title must be less than 255 characters")
    }

    const document = await prisma.document.create({
      data: {
        title,
        ownerId: userId,
        content: "",
        isLocalOnly: true,
        version: 0,
      },
    })

    console.log(`[Action] Document created: ${document.id}`)

    return {
      success: true,
      document,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create document"
    console.error("[Action Error] createDocument:", message)
    throw new Error(message)
  }
}


export async function getUserDocuments() {
  try {
    const userId = await getCurrentUser()

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        lastModifiedAt: true,
        createdAt: true,
        collaborators: {
          select: {
            user: { select: { name: true, email: true } },
            role: true,
          },
        },
      },
      orderBy: { lastModifiedAt: "desc" },
    })

    return {
      success: true,
      documents,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch documents"
    console.error("[Action Error] getUserDocuments:", message)
    throw new Error(message)
  }
}

export async function getDocument(docId: string) {
  try {
    const permission = await getDocumentPermission(docId)

    if (permission === "none") {
      throw new Error("Access denied")
    }

    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        title: true,
        content: true,
        ownerId: true,
        version: true,
        lastModifiedAt: true,
        createdAt: true,
        collaborators: {
          select: {
            id: true,
            userId: true,
            role: true,
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        },
      },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    return {
      success: true,
      document,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch document"
    console.error("[Action Error] getDocument:", message)
    throw new Error(message)
  }
}

export async function updateDocument(
  docId: string,
  input: DocumentUpdateInput
) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    
    const permission = await getDocumentPermission(docId)

    if (permission !== "editor" && permission !== "owner") {
      throw new Error("You don't have permission to edit this document")
    }

    if (input.title && input.title.length > 255) {
      throw new Error("Title must be less than 255 characters")
    }

    const updateData: Prisma.DocumentUpdateInput = {}
    if (input.title !== undefined) {
      updateData.title = input.title.trim() || "Untitled Document"
    }
    if (input.content !== undefined) {
      updateData.content = input.content
      updateData.version = { increment: 1 }
      updateData.isLocalOnly = false
    }

    const document = await prisma.document.update({
      where: { id: docId },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        version: true,
      },
    })

    console.log(`[Action] Document updated: ${docId}`)

    return {
      success: true,
      document,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update document"
    console.error("[Action Error] updateDocument:", message)
    throw new Error(message)
  }
}
export async function deleteDocument(docId: string) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    
    const permission = await getDocumentPermission(docId)

    if (permission !== "owner") {
      throw new Error("Only the owner can delete this document")
    }

    await prisma.document.delete({
      where: { id: docId },
    })

    console.log(`[Action] Document deleted: ${docId}`)

    return {
      success: true,
      message: "Document deleted",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete document"
    console.error("[Action Error] deleteDocument:", message)
    throw new Error(message)
  }
}