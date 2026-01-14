// app/components/dashboard/delete-dialog.tsx

"use client"

import { useState } from "react"
import { deleteDocument } from "@/app/actions/document"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface DeleteDialogProps {
  docId: string
  title: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteDialog({
  docId,
  title,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await deleteDocument(docId)
      onConfirm()
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>

        {/* Content */}
        <h2 className="text-lg font-semibold text-slate-900 mb-2 text-center">
          Delete Document?
        </h2>

        <p className="text-sm text-slate-600 mb-2 text-center">
          Are you sure you want to delete <strong>{title}</strong>?
        </p>

        <p className="text-xs text-slate-500 mb-6 text-center">
          This action cannot be undone.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}