import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }
export default sql

// Type definitions matching the DB schema
export interface Post {
  id: string
  title: string
  slug: string
  description: string | null
  source_url: string | null
  content_snapshot: string | null
  status: "draft" | "published" | "scheduled"
  publish_date: string | null
  featured: boolean
  author: string | null
  cover_image_url: string | null
  tags: string[]
  categories: string[]
  created_at: string
  updated_at: string
}

export interface Subscriber {
  id: string
  email: string
  status: "pending" | "active" | "unsubscribed"
  token: string
  subscribed_at: string
  unsubscribed_at: string | null
  is_deleted: boolean
}

// Query helpers
export async function getPublishedPosts(limit = 10, offset = 0): Promise<Post[]> {
  const rows = await sql`
    SELECT * FROM posts
    WHERE status = 'published' AND publish_date <= NOW()
    ORDER BY publish_date DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return rows as Post[]
}

export async function getFeaturedPosts(limit = 5): Promise<Post[]> {
  const rows = await sql`
    SELECT * FROM posts
    WHERE status = 'published' AND featured = TRUE AND publish_date <= NOW()
    ORDER BY publish_date DESC
    LIMIT ${limit}
  `
  return rows as Post[]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await sql`
    SELECT * FROM posts
    WHERE slug = ${slug} AND status = 'published'
    LIMIT 1
  `
  return (rows[0] as Post) ?? null
}

export async function getRelatedPosts(postId: string, tags: string[], limit = 3): Promise<Post[]> {
  const rows = await sql`
    SELECT * FROM posts
    WHERE id != ${postId}
      AND status = 'published'
      AND publish_date <= NOW()
      AND tags && ${tags}
    ORDER BY publish_date DESC
    LIMIT ${limit}
  `
  if ((rows as Post[]).length === 0) {
    // Fallback: latest posts
    const fallback = await sql`
      SELECT * FROM posts
      WHERE id != ${postId} AND status = 'published' AND publish_date <= NOW()
      ORDER BY publish_date DESC
      LIMIT ${limit}
    `
    return fallback as Post[]
  }
  return rows as Post[]
}

export async function getAdminStats() {
  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'published') AS published,
      COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
      COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled
    FROM posts
  `
  const [subStats] = await sql`
    SELECT COUNT(*) AS active_subscribers
    FROM subscribers
    WHERE status = 'active'
        AND is_deleted = FALSE
    SELECT id, title, slug, status, publish_date, tags
    FROM posts
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return rows as Partial<Post>[]
}

export async function getActiveSubscribers(limit = 10): Promise<Pick<Subscriber, "id" | "email" | "subscribed_at">[]> {
  const rows = await sql`
    SELECT id, email, subscribed_at
    FROM subscribers
    WHERE status = 'active'
      AND is_deleted = FALSE
    ORDER BY subscribed_at DESC
    LIMIT ${limit}
  `
  return rows as Pick<Subscriber, "id" | "email" | "subscribed_at">[]
}

export async function getAllSubscribers(limit = 10): Promise<Pick<Subscriber, "id" | "email" | "status" | "subscribed_at" | "unsubscribed_at" | "is_deleted">[]> {
  const rows = await sql`
    SELECT id, email, status, subscribed_at, unsubscribed_at, is_deleted
    FROM subscribers
    ORDER BY subscribed_at DESC
    LIMIT ${limit}
  `
  return rows as Pick<Subscriber, "id" | "email" | "status" | "subscribed_at" | "unsubscribed_at" | "is_deleted">[]
}

export async function countPublishedPosts(): Promise<number> {
  const [row] = await sql`
    SELECT COUNT(*) AS count FROM posts
    WHERE status = 'published' AND publish_date <= NOW()
  `
  return Number(row.count)
}
