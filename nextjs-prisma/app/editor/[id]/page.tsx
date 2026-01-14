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
    <div className="min-h-screen bg-[#05060a] text-white">
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
        <div className="bg-yellow-500/10 border-y border-yellow-400/30 px-6 py-3 text-sm text-yellow-200 backdrop-blur">
          You have view-only access to this document
        </div>
      )}

      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_40%)]" aria-hidden="true" />
        <Editor
          docId={docId}
          initialContent={doc.content}
          readOnly={isViewOnly}
        />
      </div>
    </div>
  )
}