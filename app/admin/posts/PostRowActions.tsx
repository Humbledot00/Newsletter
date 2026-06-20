"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { publishPost, unpublishPost } from "@/lib/actions/posts"

interface Props {
  postId: string
  slug: string | null
  status: string
}

export function PostRowActions({ postId, slug, status }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      if (status === "published") {
        await unpublishPost(postId)
      } else {
        await publishPost(postId)
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/admin/posts/configure?postId=${postId}`}
        className="pill-button bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-primary)]"
      >
        Configure
      </Link>
      {slug && (
        <a
          href={`/posts/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-button bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-secondary)]"
        >
          Preview
        </a>
      )}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="pill-button bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-secondary)] disabled:opacity-50"
      >
        {isPending
          ? "..."
          : status === "published"
          ? "Unpublish"
          : "Publish"}
      </button>
    </div>
  )
}
