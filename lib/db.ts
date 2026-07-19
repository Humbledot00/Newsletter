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

export interface PostPerformance {
  id: string
  title: string
  slug: string
  views: number
  email_opens: number
  email_clicks: number
}

export interface RecentEmailOpen {
  opened_at: string
  email: string
  post_title: string
}

export interface AdminStats {
  published: number
  drafts: number
  scheduled: number
  activeSubscribers: number
  pageViews: number
  emailOpens: number
  emailClicks: number
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

export async function getRecentPosts(limit = 5): Promise<Partial<Post>[]> {
  const rows = await sql`
    SELECT id, title, slug, status, publish_date, tags
    FROM posts
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return rows as Partial<Post>[]
}

export async function getActiveSubscribers(limit?: number): Promise<Pick<Subscriber, "id" | "email" | "subscribed_at">[]> {
  if (limit !== undefined) {
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

  const rows = await sql`
    SELECT id, email, subscribed_at
    FROM subscribers
    WHERE status = 'active'
      AND is_deleted = FALSE
    ORDER BY subscribed_at DESC
  `
  return rows as Pick<Subscriber, "id" | "email" | "subscribed_at">[]
}

export async function getActiveSubscribersWithToken(limit?: number): Promise<Pick<Subscriber, "id" | "email" | "token">[]> {
  if (limit !== undefined) {
    const rows = await sql`
      SELECT id, email, token
      FROM subscribers
      WHERE status = 'active'
        AND is_deleted = FALSE
      ORDER BY subscribed_at DESC
      LIMIT ${limit}
    `
    return rows as Pick<Subscriber, "id" | "email" | "token">[]
  }

  const rows = await sql`
    SELECT id, email, token
    FROM subscribers
    WHERE status = 'active'
      AND is_deleted = FALSE
    ORDER BY subscribed_at DESC
  `
  return rows as Pick<Subscriber, "id" | "email" | "token">[]
}

export async function getSubscribersByIds(ids: string[]): Promise<Pick<Subscriber, "id" | "email" | "token">[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await sql`
    SELECT id, email, token
    FROM subscribers
    WHERE id = ANY(${ids})
      AND status = 'active'
      AND is_deleted = FALSE
  `
  return rows as Pick<Subscriber, "id" | "email" | "token">[]
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

export async function getAdminStats(): Promise<AdminStats> {
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
  `

  const [analytics] = await sql`
    SELECT
      (SELECT COUNT(*) FROM page_views) AS page_views,
      (SELECT COUNT(*) FROM email_opens) AS email_opens,
      (SELECT COUNT(*) FROM email_clicks) AS email_clicks
  `

  return {
    published: Number(stats.published),
    drafts: Number(stats.drafts),
    scheduled: Number(stats.scheduled),
    activeSubscribers: Number(subStats.active_subscribers),
    pageViews: Number(analytics.page_views),
    emailOpens: Number(analytics.email_opens),
    emailClicks: Number(analytics.email_clicks),
  }
}

export async function recordPageView(postId: string): Promise<void> {
  await sql`
    INSERT INTO page_views (post_id)
    VALUES (${postId})
  `
}

export async function recordEmailOpen(postId: string, subscriberId: string | null): Promise<void> {
  await sql`
    INSERT INTO email_opens (post_id, subscriber_id)
    VALUES (${postId}, ${subscriberId})
  `
}

export async function recordEmailClick(postId: string, subscriberId: string | null): Promise<void> {
  await sql`
    INSERT INTO email_clicks (post_id, subscriber_id)
    VALUES (${postId}, ${subscriberId})
  `
}

export async function getPostPerformance(limit = 5): Promise<PostPerformance[]> {
  const rows = await sql`
    SELECT
      p.id,
      p.title,
      p.slug,
      COALESCE(v.views, 0) AS views,
      COALESCE(o.opens, 0) AS email_opens,
      COALESCE(c.clicks, 0) AS email_clicks
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS views
      FROM page_views
      GROUP BY post_id
    ) v ON v.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS opens
      FROM email_opens
      GROUP BY post_id
    ) o ON o.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS clicks
      FROM email_clicks
      GROUP BY post_id
    ) c ON c.post_id = p.id
    WHERE p.status = 'published'
    ORDER BY v.views DESC NULLS LAST, o.opens DESC NULLS LAST
    LIMIT ${limit}
  `
  return rows as PostPerformance[]
}

export async function getRecentEmailOpens(limit = 5): Promise<RecentEmailOpen[]> {
  const rows = await sql`
    SELECT
      eo.opened_at,
      s.email,
      p.title AS post_title
    FROM email_opens eo
    JOIN posts p ON p.id = eo.post_id
    LEFT JOIN subscribers s ON s.id = eo.subscriber_id
    ORDER BY eo.opened_at DESC
    LIMIT ${limit}
  `
  return rows as RecentEmailOpen[]
}

export async function countPublishedPosts(): Promise<number> {
  const [row] = await sql`
    SELECT COUNT(*) AS count FROM posts
    WHERE status = 'published' AND publish_date <= NOW()
  `
  return Number(row.count)
}
