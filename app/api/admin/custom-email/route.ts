import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendCustomEmail } from "@/lib/actions/email"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const subject = typeof (body as Record<string, unknown>).subject === "string" ? String((body as Record<string, unknown>).subject).trim() : ""
  const emailBody = typeof (body as Record<string, unknown>).body === "string" ? String((body as Record<string, unknown>).body).trim() : ""
  const subscriberIds = Array.isArray((body as Record<string, unknown>).subscriberIds)
    ? (body as Record<string, unknown>).subscriberIds.filter((id) => typeof id === "string")
    : []
  const extraEmails = Array.isArray((body as Record<string, unknown>).extraEmails)
    ? (body as Record<string, unknown>).extraEmails
        .filter((email) => typeof email === "string")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    : []

  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 })
  }

  if (!emailBody) {
    return NextResponse.json({ error: "Email body is required" }, { status: 400 })
  }

  if (subscriberIds.length === 0 && extraEmails.length === 0) {
    return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 })
  }

  if (extraEmails.some((email) => !EMAIL_RE.test(email))) {
    return NextResponse.json({ error: "One or more extra emails are invalid" }, { status: 400 })
  }

  try {
    await sendCustomEmail(subject, emailBody, subscriberIds, extraEmails)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send custom email"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
