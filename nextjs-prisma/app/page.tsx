import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Session } from "next-auth"

export const dynamic = "force-dynamic"

const features = [
  {
    title: "Live collaboration",
    desc: "Multi-user editing with presence and conflict-free Yjs sync.",
  },
  {
    title: "Offline-ready",
    desc: "Work offline, auto-resolve changes when you reconnect.",
  },
  {
    title: "Smart autosave",
    desc: "Saves automatically after 5 minutes of inactivity. No manual save needed.",
  },
  {
    title: "Secure access",
    desc: "Role-based sharing for owners, editors, and viewers.",
  },
  {
    title: "Versioned edits",
    desc: "Every change is tracked so your work is always recoverable.",
  },
]

export default async function HomePage() {
  let session: Session | null = null
  try {
    session = await auth()
  } catch (error) {
    console.warn("[Landing] auth() failed, showing public page", error)
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">
      <div className="grid-spotlight pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 max-w-5xl w-full text-center space-y-10">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs tracking-[0.2em] uppercase text-slate-300">
            Collaborative Workspace
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight drop-shadow-[0_10px_40px_rgba(124,58,237,0.35)]">
            Nexus
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl">
            Real-time, offline-friendly document editing built for teams that move fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/auth/signin" prefetch className="cta-button cta-primary">
              Sign In
            </Link>
            <Link href="/auth/signup" prefetch className="cta-button cta-secondary">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}