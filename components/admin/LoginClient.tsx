"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Github } from "lucide-react"
import { SITE_NAME } from "@/lib/utils"

export default function LoginClient() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin"
  const error = searchParams.get("error")

  return (
    <div className="grain-bg flex min-h-screen items-center justify-center px-4">
      <div className="elevate-heavy w-full max-w-sm rounded-xl bg-[var(--surface)] p-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[var(--text-secondary)]">Admin access</p>
          <h1 className="title-font mt-2 text-2xl font-bold text-[var(--text-primary)]">{SITE_NAME}</h1>
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl })}
          className="pill-button flex w-full items-center justify-center gap-3 bg-[var(--surface-mid)] px-5 py-4 text-[11px] text-[var(--text-primary)]"
        >
          <Github size={18} />
          Sign in with GitHub
        </button>

        {error && (
          <p className="mt-4 text-center text-xs text-[var(--text-negative)]">
            Login failed: {error}. Check ADMIN_EMAIL and GitHub OAuth settings.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Access restricted to the configured admin account.
        </p>
      </div>
    </div>
  )
}
