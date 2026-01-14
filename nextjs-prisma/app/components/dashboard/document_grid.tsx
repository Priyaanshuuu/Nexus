// app/components/dashboard/document-grid.tsx

"use client"

import { useRouter } from "next/navigation"
import DocumentCard from "./document_card"

interface Document {
  id: string
  title: string
  lastModifiedAt: Date
  collaborators: Array<{
    user: { name?: string | null; email?: string | null }
    role: string
  }>
}

interface DocumentGridProps {
  documents: Document[]
}

export default function DocumentGrid({ documents }: DocumentGridProps) {
  const router = useRouter()

  if (documents.length === 0) {
    return (
      <div className="text-center py-14 bg-white/5 border border-white/10 rounded-2xl text-slate-200">
        <p className="text-base font-semibold mb-2">No documents yet</p>
        <p className="text-sm text-slate-400">
          Create one to get started collaborating
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          id={doc.id}
          title={doc.title}
          lastModifiedAt={doc.lastModifiedAt}
          collaborators={doc.collaborators}
          onDelete={() => {
            // Page will refresh automatically
          }}
        />
      ))}
    </div>
  )
}