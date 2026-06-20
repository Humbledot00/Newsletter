"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { sql } from "@/lib/db"
import type { Post } from "@/lib/db"
import { sendPublishEmail } from "@/lib/actions/email"

export interface CreatePostData {
  title: string
  slug: string
  description: string | null
  source_url: string | null
  content_snapshot: string | null
  author: string | null
  cover_image_url: string | null
  tags: string[]
  categories: string[]
  status: "draft" | "published" | "scheduled"
  publish_date: string | null
  featured: boolean
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const rows = await sql`
    INSERT INTO posts (
      title, slug, description, source_url, content_snapshot,
      author, cover_image_url, tags, categories,
      status, publish_date, featured
    ) VALUES (
      ${data.title}, ${data.slug}, ${data.description}, ${data.source_url},
      ${data.content_snapshot}, ${data.author}, ${data.cover_image_url},
      ${data.tags}, ${data.categories},
      ${data.status}, ${data.publish_date ? new Date(data.publish_date) : null},
      ${data.featured}
    )
    RETURNING *
  `
  const post = rows[0] as Post
  revalidateTag("posts")
  revalidatePath("/posts")
  revalidatePath("/")
  return post
}

export async function updatePost(
  id: string,
  data: Partial<CreatePostData>
): Promise<Post> {
  const rows = await sql`
    UPDATE posts SET
      title        = COALESCE(${data.title ?? null}, title),
      slug         = COALESCE(${data.slug ?? null}, slug),
      description  = COALESCE(${data.description ?? null}, description),
      source_url   = COALESCE(${data.source_url ?? null}, source_url),
      content_snapshot = COALESCE(${data.content_snapshot ?? null}, content_snapshot),
      author       = COALESCE(${data.author ?? null}, author),
      cover_image_url = COALESCE(${data.cover_image_url ?? null}, cover_image_url),
      tags         = COALESCE(${data.tags ?? null}, tags),
      categories   = COALESCE(${data.categories ?? null}, categories),
      status       = COALESCE(${data.status ?? null}, status),
      publish_date = COALESCE(${data.publish_date ? new Date(data.publish_date) : null}, publish_date),
      featured     = COALESCE(${data.featured ?? null}, featured),
      updated_at   = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  const post = rows[0] as Post
  revalidateTag("posts")
  revalidatePath("/posts")
  revalidatePath(`/posts/${post.slug}`)
  revalidatePath("/")
  return post
}

export async function publishPost(postId: string): Promise<void> {
  const rows = await sql`
    UPDATE posts
    SET status = 'published', publish_date = NOW(), updated_at = NOW()
    WHERE id = ${postId}
    RETURNING slug
  `
  if (rows.length === 0) throw new Error("Post not found")
  const slug = (rows[0] as { slug: string }).slug

  revalidateTag("posts")
  revalidatePath("/")
  revalidatePath("/posts")
  revalidatePath(`/posts/${slug}`)

  // Fire-and-forget email — errors are logged but don't throw
  try {
    await sendPublishEmail(postId)
  } catch (err) {
    console.error("Failed to send publish email:", err)
  }
}

export async function unpublishPost(postId: string): Promise<void> {
  const rows = await sql`
    UPDATE posts
    SET status = 'draft', updated_at = NOW()
    WHERE id = ${postId}
    RETURNING slug
  `
  if (rows.length === 0) throw new Error("Post not found")
  const slug = (rows[0] as { slug: string }).slug

  revalidateTag("posts")
  revalidatePath("/")
  revalidatePath("/posts")
  revalidatePath(`/posts/${slug}`)
}

export async function deletePost(postId: string): Promise<void> {
  await sql`DELETE FROM posts WHERE id = ${postId}`
  revalidateTag("posts")
  revalidatePath("/")
  revalidatePath("/posts")
}
