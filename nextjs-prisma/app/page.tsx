// app/page.tsx

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Nexus</h1>
        <p className="text-xl mb-8 text-blue-100">
          Collaborative document editing with offline support
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/signin">
            <button className="px-8 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition">
              Sign In
            </button>
          </Link>

          <Link href="/auth/signup">
            <button className="px-8 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}