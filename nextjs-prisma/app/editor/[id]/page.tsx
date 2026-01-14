import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getDocumentPermission } from "@/lib/auth/permission"
import EditorHeader from "@/app/components/editor/editor_header"
import Editor from "@/app/components/editor/editor"

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const { id: docId } = await params

  // Check permission
  const permission = await getDocumentPermission(docId)
  if (permission === "none") {
    redirect("/dashboard")
  }

  // Fetch document
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      collaborators: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  })

  if (!doc) {
    redirect("/dashboard")
  }

  // Check if viewer can only read
  const isViewOnly = permission === "viewer"

  return (
    <>
      <EditorHeader
        docId={docId}
        title={doc.title}
        lastModified={doc.lastModifiedAt}
        collaborators={doc.collaborators.map((c) => ({
          user: c.user,
          role: c.role,
        }))}
      />

      {isViewOnly && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 text-sm text-yellow-800">
          You have view-only access to this document
        </div>
      )}

      <Editor
        docId={docId}
        initialContent={doc.content}
        readOnly={isViewOnly}
      />
    </>
  )
}