// app/components/dashboard/document-card.tsx

"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Users } from "lucide-react"
import { useState } from "react"
import DeleteDialog from "./delete_dialog"

interface DocumentCardProps {
  id: string
  title: string
  lastModifiedAt: Date
  collaborators: Array<{
    user: { name?: string | null; email?: string | null }
    role: string
  }>
  onDelete: () => void
}

export default function DocumentCard({
  id,
  title,
  lastModifiedAt,
  collaborators,
  onDelete,
}: DocumentCardProps) {
  const [showDelete, setShowDelete] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition p-6">
        {/* Title */}
        <Link href={`/editor/${id}`}>
          <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 mb-2 cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Last Modified */}
        <p className="text-sm text-slate-500 mb-4">
          Modified {formatDistanceToNow(new Date(lastModifiedAt), { addSuffix: true })}
        </p>

        {/* Collaborators */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            {collaborators.length === 0
              ? "Private"
              : `${collaborators.length} collaborator${collaborators.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/editor/${id}`} className="flex-1">
            <button className="w-full px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition">
              Open
            </button>
          </Link>

          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Dialog */}
      {showDelete && (
        <DeleteDialog
          docId={id}
          title={title}
          onConfirm={() => {
            onDelete()
            setShowDelete(false)
          }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  )
}