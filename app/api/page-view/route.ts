import { NextRequest, NextResponse } from "next/server"
import { recordPageView } from "@/lib/db"

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId")
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 })
  }

  try {
    await recordPageView(postId)
  } catch (error) {
    console.error("Failed to record page view", error)
  }

  return NextResponse.json({ success: true })
}
