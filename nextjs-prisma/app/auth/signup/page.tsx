"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUpWithCredentials } from "@/app/actions/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await signUpWithCredentials({ email, password, name })
        router.push("/dashboard")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to sign up"
        setError(msg)
      }
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">
      <div className="grid-spotlight" aria-hidden="true" />

      <div className="max-w-5xl w-full grid md:grid-cols-[1.2fr_1fr] gap-8 items-center z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs tracking-[0.2em] uppercase text-slate-300">
            Join the workspace
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Create your Nexus account</h1>
          <p className="text-slate-300 max-w-xl">
            Start collaborating in real time with offline resilience, conflict-free syncing, and secure sharing.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3 className="text-lg font-semibold">Offline-ready</h3>
              <p className="text-sm text-slate-300">Work without connection; changes sync seamlessly later.</p>
            </div>
            <div className="feature-card">
              <h3 className="text-lg font-semibold">Granular roles</h3>
              <p className="text-sm text-slate-300">Invite collaborators as viewers or editors securely.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-purple-500/25 to-transparent blur-2xl" aria-hidden="true" />
          <form
            onSubmit={handleSubmit}
            className="relative bg-[#0b0f1a]/80 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Sign Up</h2>
              <p className="text-sm text-slate-300">Create your account to start collaborating.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="cta-button cta-primary w-full justify-center disabled:opacity-70"
            >
              {isPending ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-cyan-300 hover:text-white">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
