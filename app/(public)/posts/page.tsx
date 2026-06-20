import type { Metadata } from "next"
import Link from "next/link"
import { getPublishedPosts, countPublishedPosts } from "@/lib/db"
import { PostCard } from "@/components/PostCard"
import { SITE_NAME } from "@/lib/utils"

const POSTS_PER_PAGE = 10

export const metadata: Metadata = {
  title: `All Posts | ${SITE_NAME}`,
  description: "Browse all published posts.",
}

export const revalidate = 300

interface PostsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const offset = (page - 1) * POSTS_PER_PAGE

  const [posts, totalCount] = await Promise.all([
    getPublishedPosts(POSTS_PER_PAGE, offset),
    countPublishedPosts(),
  ])

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-xl bg-[var(--surface)] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[1.8px] text-[var(--text-secondary)]">
          Catalog
        </p>
        <h1 className="title-font mt-2 text-4xl font-bold">All Posts</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {totalCount} {totalCount === 1 ? "post" : "posts"} published
        </p>
      </div>

      {posts.length === 0 && (
        <div className="rounded-xl bg-[var(--surface)] p-16 text-center">
          <p className="text-lg font-bold text-[var(--text-primary)]">No posts yet</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Check back soon — content is on its way.
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} size="small" />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4">
          {hasPrev ? (
            <Link
              href={`/posts?page=${page - 1}`}
              className="pill-button bg-[var(--surface)] px-5 py-3 text-[10px] text-[var(--text-primary)]"
            >
              Previous
            </Link>
          ) : (
            <span className="pill-button bg-[var(--surface)] px-5 py-3 text-[10px] text-[var(--text-secondary)] opacity-50">
              Previous
            </span>
          )}

          <span className="text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            Page {page} of {totalPages}
          </span>

          {hasNext ? (
            <Link
              href={`/posts?page=${page + 1}`}
              className="pill-button bg-[var(--surface)] px-5 py-3 text-[10px] text-[var(--text-primary)]"
            >
              Next
            </Link>
          ) : (
            <span className="pill-button bg-[var(--surface)] px-5 py-3 text-[10px] text-[var(--text-secondary)] opacity-50">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
