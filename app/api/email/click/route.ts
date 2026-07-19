import { NextRequest, NextResponse } from "next/server"
import { recordEmailClick } from "@/lib/db"

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId")
  const subscriberId = req.nextUrl.searchParams.get("subscriberId")
  const url = req.nextUrl.searchParams.get("url")

  if (!postId || !url) {
    return NextResponse.json({ error: "Missing postId or url" }, { status: 400 })
  }

  try {
    await recordEmailClick(postId, subscriberId)
  } catch (error) {
    console.error("Failed to record email click", error)
  }

  return NextResponse.redirect(url)
}
