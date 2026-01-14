// app/components/editor/editor-header.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Share2, Users, Clock } from "lucide-react"
import ShareDialog from "./share_dialog"
import Collaborators from "./collaborators"
import { updateDocument } from "@/app/actions/document"

interface EditorHeaderProps {
  docId: string
  title: string
  lastModified: Date
  collaborators: Array<{
    user: { name?: string | null; email?: string | null }
    role: string
  }>
  isSaving?: boolean
}

export default function EditorHeader({
  docId,
  title,
  lastModified,
  collaborators,
  isSaving = false,
}: EditorHeaderProps) {
  const [showShare, setShowShare] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [currentTitle, setCurrentTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleTitleSave = async () => {
    if (currentTitle.trim() && currentTitle !== title) {
      try {
        await updateDocument(docId, {
          title: currentTitle.trim(),
        })
        setIsEditing(false)
      } catch (error) {
        alert("Failed to save title")
        setCurrentTitle(title)
      }
    } else {
      setCurrentTitle(title)
      setIsEditing(false)
    }
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Back Button */}
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </Link>

          {/* Sync Status */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {isSaving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Saved
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCollaborators(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave()
                  if (e.key === "Escape") {
                    setCurrentTitle(title)
                    setIsEditing(false)
                  }
                }}
                autoFocus
                className="flex-1 text-2xl font-bold text-slate-900 outline-none border-b-2 border-blue-500"
              />
            </div>
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-2xl font-bold text-slate-900 cursor-pointer hover:text-blue-600"
            >
              {currentTitle}
            </h1>
          )}

          <p className="text-sm text-slate-500 mt-1">
            Modified {new Date(lastModified).toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Share Dialog */}
      {showShare && (
        <ShareDialog
          docId={docId}
          onClose={() => setShowShare(false)}
          collaborators={collaborators}
        />
      )}

      {/* Collaborators Dialog */}
      {showCollaborators && (
        <Collaborators
          collaborators={collaborators}
          onClose={() => setShowCollaborators(false)}
        />
      )}
    </>
  )
}