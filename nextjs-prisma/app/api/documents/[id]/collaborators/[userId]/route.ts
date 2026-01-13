// app/api/documents/[id]/collaborators/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission";
import type { UpdateCollaboratorInput } from "@/types/collaborator"

/**
 * PATCH /api/documents/[id]/collaborators/[userId]
 * Update collaborator role
 * Only OWNER can update roles
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    
    const { id: docId, userId: targetUserId } = await params

    // Check permission - only owner can update roles
    const permission = await getDocumentPermission(docId)
    if (permission !== "owner") {
      return NextResponse.json(
        { error: "Only document owner can update roles" },
        { status: 403 }
      )
    }

    // Prevent owner from changing their own role
    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: { ownerId: true },
    })

    if (targetUserId === document?.ownerId) {
      return NextResponse.json(
        { error: "Cannot change document owner's role" },
        { status: 400 }
      )
    }

    const body = await request.json() as UpdateCollaboratorInput

    // Validate role
    const validRoles = ["EDITOR", "VIEWER", "OWNER"]
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be EDITOR, VIEWER, or OWNER" },
        { status: 400 }
      )
    }

    // Update collaborator
    const collaborator = await prisma.collaborator.update({
      where: {
        docId_userId: {
          docId,
          userId: targetUserId,
        },
      },
      data: {
        role: body.role as "OWNER" | "EDITOR" | "VIEWER",
      },
      select: {
        id: true,
        userId: true,
        docId: true,
        role: true,
        addedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    console.log(
      `[API] Collaborator role updated: ${targetUserId} → ${body.role}`
    )

    return NextResponse.json(collaborator)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role"
    console.error("[API Error] PATCH /documents/[id]/collaborators/[userId]:", message)

    if (message.includes("not found")) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/documents/[id]/collaborators/[userId]
 * Remove collaborator from document
 * Only OWNER can remove collaborators
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const userId = await getCurrentUser()
    console.log(userId);
    
    const { id: docId, userId: targetUserId } = await params

    // Check permission - only owner can remove collaborators
    const permission = await getDocumentPermission(docId)
    if (permission !== "owner") {
      return NextResponse.json(
        { error: "Only document owner can remove collaborators" },
        { status: 403 }
      )
    }

    // Prevent owner from removing themselves
    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: { ownerId: true },
    })

    if (targetUserId === document?.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove document owner" },
        { status: 400 }
      )
    }

    // Remove collaborator
    await prisma.collaborator.delete({
      where: {
        docId_userId: {
          docId,
          userId: targetUserId,
        },
      },
    })

    console.log(`[API] Collaborator removed: ${targetUserId} from doc ${docId}`)

    return NextResponse.json({
      success: true,
      message: "Collaborator removed",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove collaborator"
    console.error("[API Error] DELETE /documents/[id]/collaborators/[userId]:", message)

    if (message.includes("not found")) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}