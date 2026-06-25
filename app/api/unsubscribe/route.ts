import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { absoluteUrl, SITE_NAME } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token || token === "test") {
    return new NextResponse(
      buildPage("Invalid unsubscribe link.", false),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }

  const rows = await sql`
    SELECT id, status FROM subscribers WHERE token = ${token} LIMIT 1
  ` as { id: string; status: string }[]

  if (rows.length === 0) {
    return new NextResponse(
      buildPage("Unsubscribe link is invalid or expired.", false),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }

  const sub = rows[0]

  if (sub.status === "unsubscribed") {
    return new NextResponse(
      buildPage("You are already unsubscribed.", true),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }

  await sql`
    UPDATE subscribers
    SET status = 'unsubscribed', unsubscribed_at = NOW(), is_deleted = TRUE
    WHERE id = ${sub.id}
  `

  return new NextResponse(
    buildPage("You have been unsubscribed.", true),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  )
}

function buildPage(message: string, success: boolean): string {
  const siteUrl = absoluteUrl("/")
  const color = success ? "#16a34a" : "#dc2626"
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribe — ${SITE_NAME}</title>
</head>
<body style="margin:0;padding:40px 16px;background:#fafaf8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;text-align:center;">
  <p style="font-size:18px;font-weight:600;color:#111111;">${SITE_NAME}</p>
  <p style="margin-top:16px;font-size:16px;color:${color};">${message}</p>
  <a href="${siteUrl}" style="display:inline-block;margin-top:24px;font-size:14px;color:#2563eb;">← Back to site</a>
</body>
</html>`
}
