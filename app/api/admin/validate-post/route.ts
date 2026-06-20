import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchPostContent, parsePost, validatePost } from "@/lib/content"

export async function POST(req: NextRequest) {
  // Only accessible to authenticated admin
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (typeof body !== "object" || body === null || !("url" in body) || typeof (body as Record<string, unknown>).url !== "string") {
    return NextResponse.json({ error: "Missing or invalid 'url' field" }, { status: 400 })
  }

  const { url } = body as { url: string }

  try {
    const raw = await fetchPostContent(url)
    const { frontmatter, content } = parsePost(raw)
    const validation = validatePost(frontmatter, content)

    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      frontmatter,
      content,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json(
      { error: message, errors: [{ line: 0, message }] },
      { status: 400 }
    )
  }
}
