// app/components/editor/share-dialog.tsx

"use client"

import { useState } from "react"
import { X, Mail } from "lucide-react"
import { addCollaborator, searchUsers } from "@/app/actions/collaborators"

interface Collaborator {
  user: { name?: string | null; email?: string | null }
  role: string
}

interface ShareDialogProps {
  docId: string
  collaborators: Collaborator[]
  onClose: () => void
}

export default function ShareDialog({
  docId,
  collaborators,
  onClose,
}: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("EDITOR")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await addCollaborator(docId, {
        email: email.trim(),
        role: role as "OWNER" | "EDITOR" | "VIEWER",
      })

      setSuccess(true)
      setEmail("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to share"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Share Document</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Collaborators */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Current Collaborators
          </h3>
          {collaborators.length === 0 ? (
            <p className="text-sm text-slate-500">Private document</p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab, idx) => (
                <div key={idx} className="text-sm">
                  <p className="text-slate-900">{collab.user.email}</p>
                  <p className="text-xs text-slate-500">{collab.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Form */}
        <form onSubmit={handleShare} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Permission Level
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="VIEWER">Viewer (Read Only)</option>
              <option value="EDITOR">Editor (Can Edit)</option>
              <option value="OWNER">Owner (Full Access)</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
              Shared successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition"
          >
            <Mail className="w-4 h-4" />
            {loading ? "Sharing..." : "Share"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}