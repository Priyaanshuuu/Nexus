// app/api/documents/[id]/collaborators/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import type { AddCollaboratorInput } from "@/types/collaborator"

/**
 * GET /api/documents/[id]/collaborators
 * List all collaborators for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id

    // Check permission - anyone with access can see collaborators
    const permission = await getDocumentPermission(docId)
    if (permission === "none") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get document with collaborators
    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        ownerId: true,
        collaborators: {
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
          orderBy: { addedAt: "asc" },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Also include owner as a collaborator (implicit OWNER role)
    const owner = await prisma.user.findUnique({
      where: { id: document.ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    const collaborators = [
      {
        id: `owner-${document.ownerId}`,
        userId: document.ownerId,
        docId: docId,
        role: "OWNER",
        addedAt: new Date(0), // Earliest timestamp for sorting
        user: owner,
      },
      ...document.collaborators,
    ]

    return NextResponse.json(collaborators)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch collaborators"
    console.error("[API Error] GET /documents/[id]/collaborators:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/documents/[id]/collaborators
 * Add a collaborator to a document
 * Only OWNER can add collaborators
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUser()
    console.log(userId)
    const docId = params.id

    // Check permission - only owner can add collaborators
    const permission = await getDocumentPermission(docId)
    if (permission !== "owner") {
      return NextResponse.json(
        { error: "Only document owner can add collaborators" },
        { status: 403 }
      )
    }

    const body = await request.json() as AddCollaboratorInput

    // Validate input
    if (!body.email || !body.role) {
      return NextResponse.json(
        { error: "Missing email or role" },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ["OWNER", "EDITOR", "VIEWER"]
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, EDITOR, or VIEWER" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, name: true, email: true, image: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${body.email} not found` },
        { status: 404 }
      )
    }

    // Can't add owner as collaborator (they're already owner)
    const document = await prisma.document.findUnique({
      where: { id: docId },
      select: { ownerId: true },
    })

    if (user.id === document?.ownerId) {
      return NextResponse.json(
        { error: "Cannot add document owner as collaborator" },
        { status: 400 }
      )
    }

    // Check if already a collaborator
    const existing = await prisma.collaborator.findUnique({
      where: {
        docId_userId: {
          docId,
          userId: user.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 409 } // Conflict
      )
    }

    // Add collaborator
    const collaborator = await prisma.collaborator.create({
      data: {
        docId,
        userId: user.id,
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
      `[API] Collaborator added: ${user.email} (${body.role}) to doc ${docId}`
    )

    return NextResponse.json(collaborator, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add collaborator"
    console.error("[API Error] POST /documents/[id]/collaborators:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}