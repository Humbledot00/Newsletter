import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Post } from "@/lib/db"
import { absoluteUrl, SITE_NAME } from "@/lib/utils"

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const posts = (await sql`
    SELECT title, slug, description, publish_date, author, tags
    FROM posts
    WHERE status = 'published' AND publish_date <= NOW()
    ORDER BY publish_date DESC
    LIMIT 20
  `) as Pick<Post, "title" | "slug" | "description" | "publish_date" | "author" | "tags">[]

  const siteUrl = absoluteUrl("/")
  const feedUrl = absoluteUrl("/feed.xml")
  const now = new Date().toUTCString()

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/posts/${post.slug}`)
      const pubDate = post.publish_date
        ? new Date(post.publish_date).toUTCString()
        : now
      const description = post.description
        ? escapeXml(post.description)
        : ""
      const categories = (post.tags ?? [])
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("\n      ")

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ""}
      ${description ? `<description>${description}</description>` : ""}
      ${categories}
    </item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${siteUrl}</link>
    <description>Latest posts from ${escapeXml(SITE_NAME)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
