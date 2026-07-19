import { NextRequest, NextResponse } from "next/server"
import { recordEmailOpen } from "@/lib/db"

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId")
  const subscriberId = req.nextUrl.searchParams.get("subscriberId")

  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 })
  }

  try {
    await recordEmailOpen(postId, subscriberId)
  } catch (error) {
    console.error("Failed to record email open", error)
  }

  return NextResponse.redirect(new URL("/favicon.ico", req.url))
}
