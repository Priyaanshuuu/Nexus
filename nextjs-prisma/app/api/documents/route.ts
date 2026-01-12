import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/permission"
import type { DocumentCreateInput } from "@/types/document"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUser()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      )
    }

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
      orderBy: { lastModifiedAt: "desc" },
    })

    return NextResponse.json(documents)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch documents"
    console.error("[API Error] GET /documents:", message)
    return NextResponse.json({ error: message }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      )
    }

    const body = await request.json() as DocumentCreateInput

    const title = body.title?.trim() || "Untitled Document"

    if (title.length > 255) {
      return NextResponse.json(
        { error: "Title must be less than 255 characters" },
        { status: 400 }
      )
    }

    const document = await prisma.document.create({
      data: {
        title,
        ownerId: userId,
        content: "",
        isLocalOnly: true,
        version: 0,
      },
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

    console.log(`[API] Document created: ${document.id} by user ${userId}`)

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create document"
    console.error("[API Error] POST /documents:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}