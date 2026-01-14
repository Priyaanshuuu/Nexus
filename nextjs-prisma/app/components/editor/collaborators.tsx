// app/components/editor/collaborators.tsx

"use client"

import { X } from "lucide-react"

interface Collaborator {
  user: { name?: string | null; email?: string | null }
  role: string
}

interface CollaboratorsProps {
  collaborators: Collaborator[]
  onClose: () => void
}

export default function Collaborators({
  collaborators,
  onClose,
}: CollaboratorsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0b0f1a] border border-white/10 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 backdrop-blur">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Collaborators
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {collaborators.length === 0 ? (
            <p className="text-sm text-slate-500">No collaborators yet</p>
          ) : (
            collaborators.map((collab, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {collab.user.name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">{collab.user.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 text-slate-700">
                  {collab.role}
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}