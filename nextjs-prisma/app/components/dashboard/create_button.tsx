// app/components/dashboard/create-button.tsx

"use client"

import { useState } from "react"
import { createDocument } from "@/app/actions/document"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function CreateButton() {
  const [showDialog, setShowDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createDocument({ title: title.trim() })
      
      if (result.success) {
        setShowDialog(false)
        setTitle("")
        router.push(`/editor/${result.document.id}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition"
      >
        <Plus className="w-4 h-4" />
        New Document
      </button>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Create New Document
            </h2>

            <input
              type="text"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
              }}
              autoFocus
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDialog(false)
                  setTitle("")
                  setError(null)
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={loading || !title.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}