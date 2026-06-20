import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/db"
import { formatDate } from "@/lib/utils"

interface PostCardProps {
  post: Partial<Post>
  size?: "large" | "small"
}

export function PostCard({ post, size = "small" }: PostCardProps) {
  const href = `/posts/${post.slug}`

  if (size === "large") {
    return (
      <Link
        href={href}
        className="group elevate-medium block overflow-hidden rounded-lg bg-[var(--surface)] transition-all duration-200 hover:bg-[var(--surface-mid)]"
      >
        {post.cover_image_url && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
            <Image
              src={post.cover_image_url}
              alt={post.title ?? ""}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 780px"
            />
          </div>
        )}
        <div className="p-5">
          <TagList tags={post.tags ?? []} />
          <h2 className="title-font mt-3 text-2xl font-bold leading-heading text-[var(--text-primary)]">
            {post.title}
          </h2>
          {post.description && (
            <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
              {post.description}
            </p>
          )}
          <p className="mt-4 text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            {formatDate(post.publish_date)}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group elevate-medium flex flex-col overflow-hidden rounded-lg bg-[var(--surface)] transition-all duration-200 hover:bg-[var(--surface-mid)]"
    >
      {post.cover_image_url && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.cover_image_url}
            alt={post.title ?? ""}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 380px"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <TagList tags={(post.tags ?? []).slice(0, 2)} />
        <h3 className="mt-2 font-bold leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>
        {post.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">
            {post.description}
          </p>
        )}
        <p className="mt-auto pt-3 text-[11px] uppercase tracking-[1.1px] text-[var(--text-secondary)]">
          {formatDate(post.publish_date)}
        </p>
      </div>
    </Link>
  )
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[var(--surface-mid)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--text-secondary)]"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
