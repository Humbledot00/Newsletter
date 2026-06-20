import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Subscriber } from "@/lib/db"
import { sendConfirmationEmail } from "@/lib/actions/email"

// Simple email regex — validated server-side, HTML input provides first-level check
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Naïve rate-limit: max 3 subscribe attempts per email per hour via DB
async function isRateLimited(email: string): Promise<boolean> {
  const [row] = await sql`
    SELECT COUNT(*) AS attempts
    FROM subscribers
    WHERE email = ${email}
      AND subscribed_at >= NOW() - INTERVAL '1 hour'
  `
  return Number((row as { attempts: string }).attempts) >= 3
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as Record<string, unknown>).email ?? "").trim().toLowerCase()
      : ""

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  // Rate limit check
  if (await isRateLimited(email)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    )
  }

  // Check existing subscriber
  const existing = (await sql`
    SELECT id, status, token FROM subscribers WHERE email = ${email} LIMIT 1
  `) as Pick<Subscriber, "id" | "status" | "token">[]

  if (existing.length > 0) {
    const sub = existing[0]
    if (sub.status === "active") {
      return NextResponse.json({ message: "already_subscribed" })
    }
    if (sub.status === "pending") {
      try {
        await sendConfirmationEmail(email, sub.token)
        return NextResponse.json({ message: "confirmation_resent" })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Email delivery failed"
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }
    if (sub.status === "unsubscribed") {
      // Re-subscribe: reset to pending with a new token
      const [updated] = await sql`
        UPDATE subscribers
        SET status = 'pending',
            token = uuid_generate_v4()::TEXT,
            subscribed_at = NOW(),
            unsubscribed_at = NULL
        WHERE id = ${sub.id}
        RETURNING token
      ` as { token: string }[]
      try {
        await sendConfirmationEmail(email, updated.token)
        return NextResponse.json({ message: "confirmation_sent" })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Email delivery failed"
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }
  }

  // New subscriber
  const [newSub] = await sql`
    INSERT INTO subscribers (email, status)
    VALUES (${email}, 'pending')
    RETURNING token
  ` as { token: string }[]

  try {
    await sendConfirmationEmail(email, newSub.token)
    return NextResponse.json({ message: "confirmation_sent" }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email delivery failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
