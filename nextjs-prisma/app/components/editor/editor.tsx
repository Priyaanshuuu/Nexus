"use client"

import { useEffect, useRef, useState } from "react"
import * as Y from "yjs"

interface EditorProps {
  docId: string
  initialContent: string
  readOnly?: boolean
}

export default function Editor({
  docId,
  initialContent,
  readOnly = false,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const ytextRef = useRef<Y.Text | null>(null)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save function with debounce
  const saveContent = async (newContent: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      })

      if (!response.ok) {
        console.error("Failed to save document")
        return
      }

      setLastSaved(new Date())
      console.log("[Editor] Document saved")
    } catch (error) {
      console.error("[Editor Error] Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    // Initialize Yjs document
    const ydoc = new Y.Doc()
    const ytext = ydoc.getText("content")
    
    // Initialize with content
    ytext.insert(0, initialContent)

    ydocRef.current = ydoc
    ytextRef.current = ytext

    editor.innerText = ytext.toString()

    // Listen to changes with auto-save
    const updateHandler = () => {
      const newContent = ytext.toString()
      setContent(newContent)
      
      if (!readOnly) {
        // Debounce auto-save: wait 1 second after last change
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveContent(newContent)
        }, 300000) // 5 minutes
      }
    }

    ytext.observe(updateHandler)

    if (!readOnly) {
      // Input handler
      const inputHandler = () => {
        const newText = editor.innerText || ""
        const currentText = ytext.toString()

        if (newText !== currentText) {
          ytext.delete(0, currentText.length)
          ytext.insert(0, newText)
        }
      }

      // Paste handler
      const pasteHandler = () => {
        setTimeout(inputHandler, 0)
      }

      editor.addEventListener("input", inputHandler)
      editor.addEventListener("paste", pasteHandler)

      return () => {
        ytext.unobserve(updateHandler)
        editor.removeEventListener("input", inputHandler)
        editor.removeEventListener("paste", pasteHandler)
        ydoc.destroy()
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
      }
    }

    return () => {
      ytext.unobserve(updateHandler)
      ydoc.destroy()
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [initialContent, docId, readOnly])

  return (
    <div className="flex-1 overflow-auto bg-black flex flex-col">
      {/* Save Status */}
      <div className="sticky top-0 px-8 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {saving && (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <span>Saving...</span>
            </>
          )}
          {!saving && lastSaved && (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Saved at {lastSaved.toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          className="min-h-full max-w-4xl mx-auto p-8 focus:outline-none prose prose-lg text-white bg-black whitespace-pre-wrap"
        />
      </div>
    </div>
  )
}