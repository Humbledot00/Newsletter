import type { MetadataRoute } from "next"
import { sql } from "@/lib/db"
import type { Post } from "@/lib/db"
import { absoluteUrl } from "@/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await sql`
    SELECT slug, updated_at
    FROM posts
    WHERE status = 'published' AND publish_date <= NOW()
    ORDER BY publish_date DESC
  `) as Pick<Post, "slug" | "updated_at">[]

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/posts"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
