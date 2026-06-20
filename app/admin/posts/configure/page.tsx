import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { fetchPostContent, parsePost } from "@/lib/content"
import { ConfigurePostForm } from "./ConfigurePostForm"

interface Props {
  searchParams: Promise<{
    sourceUrl?: string
    postId?: string
  }>
}

export default async function ConfigurePostPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const params = await searchParams
  const { sourceUrl, postId } = params

  if (!sourceUrl && !postId) {
    redirect("/admin/posts/add")
  }

  let initialContent = ""
  let initialFrontmatter: Record<string, unknown> = {}

  if (sourceUrl) {
    try {
      const raw = await fetchPostContent(sourceUrl)
      const { frontmatter, content } = parsePost(raw)
      initialContent = content
      initialFrontmatter = frontmatter as Record<string, unknown>
    } catch {
      redirect("/admin/posts/add")
    }
  }

  const authorName =
    (session.user?.name as string | undefined) ??
    (session.user?.email as string | undefined) ??
    "Admin"

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="title-font text-3xl font-bold text-[var(--text-primary)]">
          {postId ? "Edit Post" : "Configure Post"}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Fill in the metadata and publishing options for your post.
        </p>
      </div>
      <Suspense>
        <ConfigurePostForm
          postId={postId}
          sourceUrl={sourceUrl ?? null}
          initialContent={initialContent}
          frontmatter={initialFrontmatter}
          authorName={authorName}
        />
      </Suspense>
    </div>
  )
}
