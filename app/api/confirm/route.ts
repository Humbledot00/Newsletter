import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { absoluteUrl } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(absoluteUrl("/?subscribed=invalid"))
  }

  const rows = await sql`
    SELECT id, status FROM subscribers WHERE token = ${token} LIMIT 1
  ` as { id: string; status: string }[]

  if (rows.length === 0) {
    return NextResponse.redirect(absoluteUrl("/?subscribed=invalid"))
  }

  const sub = rows[0]

  if (sub.status === "active") {
    return NextResponse.redirect(absoluteUrl("/?subscribed=already"))
  }

  await sql`
    UPDATE subscribers
    SET status = 'active'
    WHERE id = ${sub.id}
  `

  return NextResponse.redirect(absoluteUrl("/?subscribed=success"))
}
