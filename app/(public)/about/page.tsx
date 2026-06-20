import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/utils"

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-6">
      <div className="rounded-xl bg-[var(--surface)] p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[1.8px] text-[var(--text-secondary)]">
          About
        </p>
        <h1 className="title-font mt-2 text-4xl font-bold leading-heading text-[var(--text-primary)]">
          Why this newsletter exists
        </h1>
      </div>
      <div className="prose mt-5 rounded-xl bg-[var(--surface)] p-5 sm:p-8">
        <p>
          This is {SITE_NAME} — a place for thoughtful writing on technology,
          development, and ideas.
        </p>
        <p>
          Posts are authored in Markdown/MDX, validated in admin, and published
          with subscriber email delivery.
        </p>
        <p>Current release focuses on a fast, single-admin workflow and SEO basics.</p>
      </div>
    </div>
  )
}
