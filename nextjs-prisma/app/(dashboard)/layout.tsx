// app/(dashboard)/layout.tsx

import { ReactNode } from "react"
//import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/app/actions/auth"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f1a]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nexus</h1>
            <p className="text-sm text-slate-300">Collaborative Workspace</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400">{session.user?.email}</p>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {children}
      </main>
    </div>
  )
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 text-sm font-semibold transition"
      >
        Sign Out
      </button>
    </form>
  )
}