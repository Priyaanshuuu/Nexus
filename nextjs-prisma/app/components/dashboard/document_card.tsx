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
      <div className="bg-[#0b0f1a]/80 border border-white/10 rounded-2xl p-6 shadow-2xl transition hover:border-white/25 hover:-translate-y-1">
        {/* Title */}
        <Link href={`/editor/${id}`}>
          <h3 className="text-lg font-semibold text-white hover:text-cyan-300 mb-2 cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Last Modified */}
        <p className="text-sm text-slate-400 mb-3">
          Modified {formatDistanceToNow(new Date(lastModifiedAt), { addSuffix: true })}
        </p>

        {/* Collaborators */}
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {collaborators.length === 0
              ? "Private"
              : `${collaborators.length} collaborator${collaborators.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/editor/${id}`} className="flex-1">
            <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-[#0b0f1a] font-semibold shadow-lg hover:shadow-xl transition">
              Open
            </button>
          </Link>

          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2 rounded-xl bg-white/10 text-red-200 border border-red-400/30 hover:bg-red-500/10 text-sm font-medium transition"
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