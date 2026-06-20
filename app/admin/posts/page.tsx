import Link from "next/link"
import { sql } from "@/lib/db"
import type { Post } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { PostRowActions } from "./PostRowActions"

export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<string, string> = {
  published: "bg-[var(--accent)] text-black",
  draft: "bg-[var(--text-warning)] text-black",
  scheduled: "bg-[var(--text-announcement)] text-black",
}

export default async function AdminPostsPage() {
  const posts = (await sql`
    SELECT id, title, slug, status, publish_date, tags, featured
    FROM posts
    ORDER BY created_at DESC
  `) as Partial<Post>[]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="title-font text-3xl font-bold text-[var(--text-primary)]">Posts</h1>
        <Link
          href="/admin/posts/add"
          className="pill-button bg-[var(--accent)] px-5 py-3 text-[10px] text-black"
        >
          Add Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-[var(--surface)]">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-[var(--text-primary)]">No posts yet</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Add your first post by pasting a raw GitHub URL.
            </p>
            <Link
              href="/admin/posts/add"
              className="pill-button mt-4 inline-flex bg-[var(--accent)] px-5 py-3 text-[10px] text-black"
            >
              Add Post
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--surface-mid)] text-left text-xs uppercase tracking-[1px] text-[var(--text-secondary)]">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Publish Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-mid)]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[var(--surface-mid)]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[var(--text-primary)]">
                      {post.title ?? "(untitled)"}
                    </span>
                    {post.featured && (
                      <span className="ml-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px] text-black">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.8px] ${STATUS_BADGE[post.status ?? "draft"] ?? ""}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
                    {post.publish_date ? formatDate(post.publish_date) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <PostRowActions
                      postId={post.id!}
                      slug={post.slug ?? null}
                      status={post.status ?? "draft"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
