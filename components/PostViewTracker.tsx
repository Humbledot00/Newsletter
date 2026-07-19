"use client"

import { useEffect } from "react"

export function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return

    void fetch(`/api/page-view?postId=${encodeURIComponent(postId)}`, {
      method: "GET",
      cache: "no-store",
    })
  }, [postId])

  return null
}
