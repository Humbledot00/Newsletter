"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ValidationError } from "@/lib/content"

export default function AddPostPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "validating" | "success" | "error">("idle")
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [preview, setPreview] = useState<{
    content: string
    frontmatter: Record<string, unknown>
    sourceUrl: string
  } | null>(null)

  function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    setStatus("validating")
    setErrors([])
    setPreview(null)

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/validate-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        if (!res.ok) {
          setStatus("error")
          setErrors(data.errors ?? [{ line: 0, message: data.error ?? "Unknown error" }])
          return
        }
        if (!data.valid) {
          setStatus("error")
          setErrors(data.errors ?? [])
          return
        }
        setPreview({
          content: data.content,
          frontmatter: data.frontmatter,
          sourceUrl: url,
        })
        setStatus("success")
      } catch {
        setStatus("error")
        setErrors([{ line: 0, message: "Network error — could not reach validation endpoint." }])
      }
    })
  }

  function handleContinue() {
    if (!preview) return
    const params = new URLSearchParams({
      sourceUrl: preview.sourceUrl,
      title: String(preview.frontmatter.title ?? ""),
      description: String(preview.frontmatter.description ?? ""),
      date: String(preview.frontmatter.date ?? ""),
      tags: Array.isArray(preview.frontmatter.tags)
        ? (preview.frontmatter.tags as string[]).join(",")
        : String(preview.frontmatter.tags ?? ""),
    })
    router.push(`/admin/posts/configure?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="title-font text-3xl font-bold text-[var(--text-primary)]">Add Post</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Paste a raw GitHub file URL to import and validate a Markdown post.
        </p>
      </div>

      <form onSubmit={handleFetch} className="space-y-4 rounded-xl bg-[var(--surface)] p-5 sm:p-6">
        <div className="space-y-1.5">
          <label
            htmlFor="sourceUrl"
            className="block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]"
          >
            Raw GitHub URL
          </label>
          <input
            id="sourceUrl"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://raw.githubusercontent.com/user/repo/main/posts/my-post.md"
            required
            className="spotify-input focus-ring h-12 w-full border-0 px-5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="pill-button bg-[var(--accent)] px-5 py-3 text-[10px] text-black disabled:opacity-50"
        >
          {isPending ? "Fetching & Validating…" : "Fetch & Validate"}
        </button>
      </form>

      {status === "error" && errors.length > 0 && (
        <div className="mt-6 rounded-xl bg-[var(--surface)] p-4">
          <p className="mb-2 text-sm font-medium text-[var(--text-negative)]">
            Validation failed — {errors.length} issue{errors.length !== 1 ? "s" : ""} found
          </p>
          <ul className="space-y-1 text-sm text-[var(--text-negative)]">
            {errors.map((err, i) => (
              <li key={i}>
                {err.line > 0 ? (
                  <span className="mr-2 rounded bg-[var(--surface-mid)] px-1.5 py-0.5 text-xs font-mono text-[var(--text-primary)]">
                    L{err.line}
                  </span>
                ) : null}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "success" && preview && (
        <>
          <div className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
              Preview — <span className="font-normal text-[var(--text-secondary)]">{String(preview.frontmatter.title)}</span>
            </h2>
            <div className="rounded-xl bg-[var(--surface)]">
              <div className="border-b border-[var(--surface-mid)] px-5 py-4">
                {(["title", "description", "date"] as const).map((key) => (
                  <div key={key} className="mt-1 flex gap-2 text-sm">
                    <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-[1px] text-[var(--text-secondary)]">{key}</span>
                    <span className="text-[var(--text-primary)]">{String(preview.frontmatter[key] ?? "—")}</span>
                  </div>
                ))}
              </div>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
                {preview.content}
              </pre>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleContinue}
              className="pill-button bg-[var(--accent)] px-6 py-3 text-[10px] text-black"
            >
              Continue to Metadata
            </button>
          </div>
        </>
      )}
    </div>
  )
}
