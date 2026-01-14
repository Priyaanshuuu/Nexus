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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>
          <p className="text-slate-500 mt-1">
            Create and manage your collaborative documents
          </p>
        </div>

        <CreateButton />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error Loading Documents</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {!error && <DocumentGrid documents={documents} />}
    </div>
  )
}