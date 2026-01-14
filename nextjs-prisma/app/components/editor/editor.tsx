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

    // Listen to changes
    const updateHandler = () => {
      const newContent = ytext.toString()
      setContent(newContent)
      
      // Auto-save (debounced in production)
      if (!readOnly) {
        // TODO: Implement auto-save API call
        // fetch(`/api/documents/${docId}`, {
        //   method: 'PATCH',
        //   body: JSON.stringify({ content: newContent })
        // })
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
      }
    }

    return () => {
      ytext.unobserve(updateHandler)
      ydoc.destroy()
    }
  }, [initialContent, docId, readOnly])

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className="min-h-full max-w-4xl mx-auto p-8 focus:outline-none prose prose-lg"
      />
    </div>
  )
}