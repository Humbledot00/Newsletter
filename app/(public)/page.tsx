import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Play, Radio } from "lucide-react"
import { getFeaturedPosts, getPublishedPosts } from "@/lib/db"
import { PostCard } from "@/components/PostCard"
import { NewsletterForm } from "@/components/NewsletterForm"
import { SITE_NAME } from "@/lib/utils"

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Thoughtful writing on technology, development, and ideas.",
}

// ISR: revalidate every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  const [featuredPosts, latestPosts] = await Promise.all([
    getFeaturedPosts(5),
    getPublishedPosts(6),
  ])

  const [heroPost, ...restFeatured] = featuredPosts

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 sm:px-6 sm:pt-10">
        <div className="rounded-xl bg-[var(--surface)] p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[1.8px] text-[var(--text-secondary)]">
            Weekly Dispatch
          </p>
          <h1 className="title-font mt-3 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--text-near-white)] sm:text-base">
            Content-first writing on engineering, product systems, and the craft of building.
            Dark interface, dense ideas, no filler.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/#newsletter"
              className="pill-button inline-flex items-center gap-2 bg-[var(--accent)] px-6 py-4 text-black"
            >
              <Play size={15} fill="currentColor" />
              Subscribe
            </Link>
            <Link
              href="/posts"
              className="pill-button inline-flex items-center gap-2 bg-[var(--surface-mid)] px-6 py-4 text-[var(--text-primary)]"
            >
              <Radio size={15} />
              Browse Posts
            </Link>
          </div>
        </div>
      </section>

      {heroPost && (
        <section className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="title-font text-xl font-bold">Featured</h2>
            <Link href="/posts" className="text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]">
              View all
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <PostCard post={heroPost} size="large" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {restFeatured.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} size="small" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="title-font text-xl font-bold">Latest Drops</h2>
          <Link
            href="/posts"
            className="text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]"
          >
            Catalog
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <PostCard key={post.id} post={post} size="small" />
          ))}
        </div>
      </section>

      <section id="newsletter" className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6">
        <div className="elevate-heavy rounded-xl bg-[var(--surface)] px-5 py-8 text-center sm:px-8">
          <h2 className="title-font text-2xl font-bold">Stay in rotation</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--text-secondary)] sm:text-base">
            New essays delivered by email with double opt-in and one-click unsubscribe.
          </p>
          <Suspense>
            <NewsletterForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}
