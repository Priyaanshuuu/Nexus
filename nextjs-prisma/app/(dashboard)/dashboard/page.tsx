// app/(dashboard)/dashboard/page.tsx

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUserDocuments } from "@/app/actions/document"
import DocumentGrid from "@/app/components/dashboard/document_grid"
import CreateButton from "@/app/components/dashboard/create_button"
import { AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  let documents: Awaited<ReturnType<typeof getUserDocuments>>['documents'] = []
  let error: string | null = null

  try {
    const result = await getUserDocuments()
    if (result.success) {
      documents = result.documents
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load documents"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-[0.18em] uppercase text-slate-300">
            Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">My Documents</h1>
          <p className="text-slate-300 mt-1">
            Create, manage, and collaborate in real time.
          </p>
        </div>

        <div className="shrink-0">
          <CreateButton />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-2 p-4 bg-red-500/10 border border-red-500/40 rounded-lg flex items-start gap-3 text-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Documents</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {!error && <DocumentGrid documents={documents} />}
    </div>
  )
}