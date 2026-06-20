"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

export function NewsletterForm() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get("subscribed")

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">(
    initialStatus === "success" ? "success" : "idle"
  )
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.")
        setStatus("error")
        return
      }

      if (data.message === "already_subscribed") {
        setStatus("already")
      } else {
        setStatus("success")
        setEmail("")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div>
      {status === "success" ? (
        <p className="mx-auto max-w-md rounded-full bg-[var(--surface-mid)] px-4 py-2 text-center text-sm text-[var(--text-primary)]">
          Thanks! Check your inbox for a confirmation link.
        </p>
      ) : status === "already" ? (
        <p className="mx-auto max-w-md rounded-full bg-[var(--surface-mid)] px-4 py-2 text-center text-sm text-[var(--text-secondary)]">
          You&rsquo;re already subscribed.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={status === "loading"}
            className="spotify-input focus-ring h-12 flex-1 border-0 px-5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="pill-button h-12 bg-[var(--accent)] px-6 text-black disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>

          {status === "error" && (
            <p className="w-full text-center text-sm text-[var(--text-negative)]">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
