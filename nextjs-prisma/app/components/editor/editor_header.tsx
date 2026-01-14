// app/components/editor/editor-header.tsx

"use client"

import { useState } from "react"
//import { useRouter } from "next/navigation"
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
  //const router = useRouter()

  const handleTitleSave = async () => {
    if (currentTitle.trim() && currentTitle !== title) {
      try {
        await updateDocument(docId, {
          title: currentTitle.trim(),
        })
        setIsEditing(false)
      } catch (error) {
        console.log(error);
        
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
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 bg-[#0b0f1a]/80 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          {/* Back Button */}
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-slate-200 hover:text-cyan-300 text-sm font-semibold transition">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </Link>

          {/* Sync Status */}
          <div className="flex items-center gap-2 text-xs text-slate-300 px-3 py-1 rounded-full border border-white/15 bg-white/5">
            {isSaving ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-yellow-300" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-green-300" />
                <span>Saved</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCollaborators(true)}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-200 border border-white/10"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-purple-500 to-cyan-400 text-[#0b0f1a] font-semibold shadow-lg hover:shadow-xl transition"
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
                className="flex-1 text-2xl font-bold text-white outline-none border-b-2 border-cyan-300 bg-transparent"
              />
            </div>
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-2xl font-bold text-white cursor-pointer hover:text-cyan-300 transition"
            >
              {currentTitle}
            </h1>
          )}

          <p className="text-sm text-slate-400 mt-1">
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