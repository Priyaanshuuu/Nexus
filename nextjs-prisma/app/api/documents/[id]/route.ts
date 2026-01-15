import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getCurrentUser , getDocumentPermission , requireDocumentPermission } from "@/lib/auth/permission"
import type { DocumentUpdateInput } from "@/types/document"


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id:docId} = await params

    const permission = await getDocumentPermission(docId)
    if (permission === "none") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        title: true,
        content: true,
        ownerId: true,
        version: true,
        isLocalOnly: true,
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
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch document"
    console.error("[API Error] GET /documents/[id]:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } >}
) {
  try {
    const userId = await getCurrentUser()
    const {id:docId} = await params

    await requireDocumentPermission(docId, "editor")

    const body = await request.json() as DocumentUpdateInput

    if (body.title && body.title.length > 255) {
      return NextResponse.json(
        { error: "Title must be less than 255 characters" },
        { status: 400 }
      )
    }

    const updateData: Prisma.DocumentUpdateInput = {}
    if (body.title !== undefined) {
      updateData.title = body.title.trim() || "Untitled Document"
    }
    if (body.content !== undefined) {
      updateData.content = body.content
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
        ownerId: true,
        version: true,
        isLocalOnly: true,
        lastModifiedAt: true,
        createdAt: true,
        collaborators: true,
      },
    })

    console.log(`[API] Document updated: ${docId} by user ${userId}`)

    return NextResponse.json(document)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update document"
    console.error("[API Error] PATCH /documents/[id]:", message)
    
    if (message.includes("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } >}
) {
  try {
    const userId = await getCurrentUser()
    const {id:docId} = await params

    await requireDocumentPermission(docId, "owner")

    await prisma.document.delete({
      where: { id: docId },
    })

    console.log(`[API] Document deleted: ${docId} by user ${userId}`)

    return NextResponse.json({ success: true, message: "Document deleted" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete document"
    console.error("[API Error] DELETE /documents/[id]:", message)
    
    if (message.includes("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}