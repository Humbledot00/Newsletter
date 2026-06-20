"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createPost, updatePost, publishPost } from "@/lib/actions/posts"
import { sendTestEmail } from "@/lib/actions/email"
import { slugify } from "@/lib/content"

interface Props {
  postId?: string
  sourceUrl: string | null
  initialContent: string
  frontmatter: Record<string, unknown>
  authorName: string
}

function tagsFromValue(val: unknown): string[] {
  if (Array.isArray(val)) return (val as unknown[]).map(String).filter(Boolean)
  if (typeof val === "string") return val.split(",").map((t) => t.trim()).filter(Boolean)
  return []
}

export function ConfigurePostForm({
  postId,
  sourceUrl,
  initialContent,
  frontmatter,
  authorName,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const [title, setTitle] = useState(String(frontmatter.title ?? ""))
  const [slug, setSlug] = useState(
    frontmatter.slug ? String(frontmatter.slug) : slugify(String(frontmatter.title ?? ""))
  )
  const [description, setDescription] = useState(String(frontmatter.description ?? ""))
  const [tags, setTags] = useState(tagsFromValue(frontmatter.tags).join(", "))
  const [categories, setCategories] = useState(tagsFromValue(frontmatter.categories).join(", "))
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft")
  const [publishDate, setPublishDate] = useState(
    frontmatter.date ? String(frontmatter.date).slice(0, 16) : ""
  )
  const defaultTestEmail = authorName.includes("@") ? authorName : ""
  const [testEmailTo, setTestEmailTo] = useState(defaultTestEmail)
  const [featured, setFeatured] = useState(false)
  const [savedPostId, setSavedPostId] = useState<string | null>(postId ?? null)

  function buildData(overrideStatus?: "draft" | "published" | "scheduled") {
    return {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      source_url: sourceUrl,
      content_snapshot: initialContent || null,
      author: authorName,
      cover_image_url: null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
      status: overrideStatus ?? status,
      publish_date: publishDate || null,
      featured,
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    setSlug(slugify(val))
  }

  function handleSaveDraft() {
    setError(null)
    startTransition(async () => {
      try {
        const data = buildData("draft")
        if (savedPostId) {
          await updatePost(savedPostId, data)
        } else {
          const post = await createPost(data)
          setSavedPostId(post.id)
        }
        router.push("/admin/posts")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save draft")
      }
    })
  }

  function handlePublish() {
    setError(null)
    startTransition(async () => {
      try {
        const data = buildData(status === "scheduled" ? "scheduled" : "published")
        let id = savedPostId
        if (id) {
          await updatePost(id, data)
        } else {
          const post = await createPost(data)
          id = post.id
          setSavedPostId(id)
        }
        if (status !== "scheduled") {
          await publishPost(id!)
        }
        router.push("/admin/posts")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to publish post")
      }
    })
  }

  function handleSendTest() {
    if (!savedPostId) {
      setError("Save as draft first before sending a test email.")
      return
    }
    if (!testEmailTo.trim()) {
      setError("Enter a recipient email for the test send.")
      return
    }

    setTestEmailStatus("sending")
    startTransition(async () => {
      try {
        await sendTestEmail(savedPostId, testEmailTo.trim())
        setTestEmailStatus("sent")
      } catch (err) {
        console.error(err)
        setTestEmailStatus("error")
      }
    })
  }

  return (
    <form className="space-y-5 rounded-xl bg-[var(--surface)] p-5 sm:p-6" onSubmit={(e) => e.preventDefault()}>
      {sourceUrl && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            Source URL
          </label>
          <p className="truncate rounded-full bg-[var(--surface-mid)] px-4 py-2.5 text-sm text-[var(--text-secondary)]">
            {sourceUrl}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="cfg-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="cfg-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="spotify-input focus-ring h-11 w-full border-0 px-5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label htmlFor="cfg-slug" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Slug
        </label>
        <input
          id="cfg-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="spotify-input focus-ring h-11 w-full border-0 px-5 font-mono text-sm text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label htmlFor="cfg-desc" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Description / Excerpt
        </label>
        <textarea
          id="cfg-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="focus-ring w-full resize-none rounded-lg border-0 bg-[var(--surface-mid)] px-4 py-2.5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Author
        </label>
        <p className="rounded-full bg-[var(--surface-mid)] px-4 py-2.5 text-sm text-[var(--text-secondary)]">
          {authorName}
        </p>
      </div>

      <div>
        <label htmlFor="cfg-tags" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Tags <span className="text-xs">(comma-separated)</span>
        </label>
        <input
          id="cfg-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="nextjs, typescript, tutorial"
          className="spotify-input focus-ring h-11 w-full border-0 px-5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label htmlFor="cfg-cats" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Categories <span className="text-xs">(comma-separated)</span>
        </label>
        <input
          id="cfg-cats"
          type="text"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="Development, Web"
          className="spotify-input focus-ring h-11 w-full border-0 px-5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">Status</label>
        <div className="flex flex-wrap gap-2">
          {(["draft", "published", "scheduled"] as const).map((s) => (
            <label key={s} className="pill-button flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--surface-mid)] px-4 py-2 text-[10px]">
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="accent-[var(--accent)]"
              />
              <span className="capitalize text-[var(--text-primary)]">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="cfg-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Publish Date <span className="text-xs">{status === "scheduled" ? "(required for scheduled)" : "(optional)"}</span>
        </label>
        <input
          id="cfg-date"
          type="datetime-local"
          value={publishDate}
          onChange={(e) => setPublishDate(e.target.value)}
          className="spotify-input focus-ring h-11 border-0 px-5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="cfg-featured"
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <label htmlFor="cfg-featured" className="cursor-pointer text-sm text-[var(--text-primary)]">
          Feature this post on the homepage
        </label>
      </div>

      <div>
        <label htmlFor="cfg-test-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
          Test Email Recipient
        </label>
        <input
          id="cfg-test-email"
          type="email"
          value={testEmailTo}
          onChange={(e) => setTestEmailTo(e.target.value)}
          placeholder="you@example.com"
          className="spotify-input focus-ring h-11 w-full border-0 px-5 text-sm text-[var(--text-primary)]"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-[var(--surface-mid)] px-4 py-3 text-sm text-[var(--text-negative)]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isPending || !title.trim()}
          className="pill-button bg-[var(--surface-mid)] px-5 py-3 text-[10px] text-[var(--text-primary)] disabled:opacity-50"
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => savedPostId && window.open(`/posts/${slug}`, "_blank")}
          disabled={!savedPostId}
          className="pill-button bg-[var(--surface-mid)] px-5 py-3 text-[10px] text-[var(--text-primary)] disabled:opacity-50"
        >
          Preview
        </button>

        <button
          type="button"
          onClick={handleSendTest}
          disabled={isPending || !savedPostId}
          className="pill-button bg-[var(--surface-mid)] px-5 py-3 text-[10px] text-[var(--text-primary)] disabled:opacity-50"
        >
          {testEmailStatus === "sending"
            ? "Sending..."
            : testEmailStatus === "sent"
            ? "Test Sent"
            : testEmailStatus === "error"
            ? "Send Failed"
            : "Send Test Email"}
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending || !title.trim()}
          className="pill-button ml-auto bg-[var(--accent)] px-6 py-3 text-[10px] text-black disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : status === "scheduled"
            ? "Schedule Post"
            : "Publish"}
        </button>
      </div>
    </form>
  )
}
