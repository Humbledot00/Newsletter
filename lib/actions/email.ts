"use server"

import nodemailer from "nodemailer"
import { sql } from "@/lib/db"
import type { Post, Subscriber } from "@/lib/db"
import { absoluteUrl, SITE_NAME } from "@/lib/utils"

function assertEmailEnv() {
  if (!process.env.GMAIL_EMAIL) {
    throw new Error("GMAIL_EMAIL is not configured")
  }
  if (!process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_APP_PASSWORD is not configured")
  }
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

async function sendSmtpEmail(payload: {
  to: string
  subject: string
  html: string
  text: string
}) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.GMAIL_FROM_EMAIL ?? process.env.GMAIL_EMAIL,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })
}

function buildEmailHtml({
  post,
  unsubscribeUrl,
  isTest = false,
}: {
  post: Post
  unsubscribeUrl: string
  isTest?: boolean
}): string {
  const postUrl = absoluteUrl(`/posts/${post.slug}`)
  const year = new Date().getFullYear()
  const excerpt = post.description ?? ""
  const subject = isTest ? `[TEST] ${post.title}` : post.title

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e7e7e5;">
              <span style="font-size:18px;font-weight:700;color:#111111;">${SITE_NAME}</span>
              ${isTest ? '<span style="margin-left:8px;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">TEST</span>' : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#111111;line-height:1.3;">${post.title}</h1>
              ${excerpt ? `<p style="margin:0 0 32px;font-size:16px;color:#444444;line-height:1.7;">${excerpt}</p>` : ""}
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#2563eb;border-radius:6px;">
                    <a href="${postUrl}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Read Full Post →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#888888;">Or copy this link: <a href="${postUrl}" style="color:#2563eb;">${postUrl}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e7e7e5;background:#fafaf8;">
              <p style="margin:0;font-size:13px;color:#888888;">
                © ${year} ${SITE_NAME} &nbsp;·&nbsp;
                <a href="${absoluteUrl("/")}" style="color:#888888;">${absoluteUrl("/")}</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#aaaaaa;">
                <a href="${unsubscribeUrl}" style="color:#aaaaaa;">Unsubscribe</a> from this list.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildEmailText({
  post,
  unsubscribeUrl,
  isTest = false,
}: {
  post: Post
  unsubscribeUrl: string
  isTest?: boolean
}): string {
  const postUrl = absoluteUrl(`/posts/${post.slug}`)
  const year = new Date().getFullYear()
  const subject = isTest ? `[TEST] ${post.title}` : post.title
  return [
    subject,
    "=".repeat(subject.length),
    "",
    post.description ?? "",
    "",
    `Read Full Post: ${postUrl}`,
    "",
    "---",
    `© ${year} ${SITE_NAME}  |  ${absoluteUrl("/")}`,
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n")
}

export async function sendPublishEmail(postId: string): Promise<void> {
  assertEmailEnv()

  const [postRow] = await sql`SELECT * FROM posts WHERE id = ${postId} LIMIT 1`
  if (!postRow) throw new Error("Post not found")
  const post = postRow as Post

  const subscribers = (await sql`
    SELECT id, email, token FROM subscribers WHERE status = 'active'
  `) as Pick<Subscriber, "id" | "email" | "token">[]

  if (subscribers.length === 0) return

  for (const sub of subscribers) {
    const unsubscribeUrl = absoluteUrl(`/api/unsubscribe?token=${sub.token}`)
    await sendSmtpEmail({
      to: sub.email,
      subject: post.title,
      html: buildEmailHtml({ post, unsubscribeUrl }),
      text: buildEmailText({ post, unsubscribeUrl }),
    })
  }
}

export async function sendTestEmail(postId: string, toEmail: string): Promise<void> {
  assertEmailEnv()

  const [postRow] = await sql`SELECT * FROM posts WHERE id = ${postId} LIMIT 1`
  if (!postRow) throw new Error("Post not found")
  const post = postRow as Post

  const unsubscribeUrl = absoluteUrl("/api/unsubscribe?token=test")

  await sendSmtpEmail({
    to: toEmail,
    subject: `[TEST] ${post.title}`,
    html: buildEmailHtml({ post, unsubscribeUrl, isTest: true }),
    text: buildEmailText({ post, unsubscribeUrl, isTest: true }),
  })
}

export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<void> {
  assertEmailEnv()

  const confirmUrl = absoluteUrl(`/api/confirm?token=${token}`)

  await sendSmtpEmail({
    to: email,
    subject: `Confirm your subscription to ${SITE_NAME}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Confirm subscription</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #e7e7e5;">
          <span style="font-size:18px;font-weight:700;color:#111111;">${SITE_NAME}</span>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111111;">Confirm your subscription</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.6;">
            Click the button below to confirm your subscription to ${SITE_NAME}. If you didn't subscribe, you can safely ignore this email.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#2563eb;border-radius:6px;">
              <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Confirm Subscription</a>
            </td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#888888;">Or visit: <a href="${confirmUrl}" style="color:#2563eb;">${confirmUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e7e7e5;background:#fafaf8;">
          <p style="margin:0;font-size:13px;color:#aaaaaa;">© ${new Date().getFullYear()} ${SITE_NAME}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `Confirm your subscription to ${SITE_NAME}\n\nVisit this link to confirm:\n${confirmUrl}\n\nIf you didn't subscribe, ignore this email.`,
  })
}
