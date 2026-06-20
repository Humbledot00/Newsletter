import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import { getPostBySlug, getRelatedPosts } from "@/lib/db"
import { readingTime } from "@/lib/content"
import { formatDate, absoluteUrl, SITE_NAME } from "@/lib/utils"
import { PostCard } from "@/components/PostCard"
import { CodeBlock } from "@/components/CodeBlock"

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const url = absoluteUrl(`/posts/${slug}`)

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description ?? undefined,
      url,
      type: "article",
      publishedTime: post.publish_date ?? undefined,
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export const revalidate = 300

// Allowlist-based rehype sanitization schema — strips script/iframe/object
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []).filter(
      (t) => !["script", "iframe", "object", "embed"].includes(t)
    ),
  ],
  attributes: {
    ...defaultSchema.attributes,
    code: ["className"],
    span: ["className"],
    div: ["className"],
  },
}

// MDX component overrides
const mdxComponents = {
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    const codeChild = (children as React.ReactElement<{ className?: string; children?: React.ReactNode }>)?.props
    const code = String(codeChild?.children ?? "")
    return (
      <CodeBlock className={codeChild?.className ?? ""} {...props}>
        {code}
      </CodeBlock>
    )
  },
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const content = post.content_snapshot ?? ""
  const minutes = readingTime(content)
  const relatedPosts = await getRelatedPosts(post.id, post.tags ?? [], 3)
  const postUrl = absoluteUrl(`/posts/${post.slug}`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description ?? undefined,
    url: postUrl,
    datePublished: post.publish_date ?? undefined,
    dateModified: post.updated_at ?? post.publish_date ?? undefined,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    image: post.cover_image_url ?? undefined,
    keywords: (post.tags ?? []).join(", ") || undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="lg:flex lg:gap-10">
        <div className="min-w-0 flex-1">
          {post.cover_image_url && (
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 780px"
              />
            </div>
          )}

          <header className="mb-7 rounded-xl bg-[var(--surface)] p-5 sm:p-7">
            {post.tags?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--surface-mid)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="title-font text-3xl font-bold leading-heading text-[var(--text-primary)] sm:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[1px] text-[var(--text-secondary)]">
              {post.author && <span>{post.author}</span>}
              {post.author && post.publish_date && (
                <span>•</span>
              )}
              {post.publish_date && (
                <time dateTime={post.publish_date}>
                  {formatDate(post.publish_date)}
                </time>
              )}
              <span>•</span>
              <span>{minutes} min read</span>
            </div>
          </header>

          <div className="prose max-w-none rounded-xl bg-[var(--surface)] p-5 sm:p-8">
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [rehypeSanitize, sanitizeSchema],
                    rehypeHighlight,
                  ],
                },
              }}
            />
          </div>

          <div className="mt-10 rounded-xl bg-[var(--surface)] p-8 text-center">
            <h2 className="title-font text-xl font-bold text-[var(--text-primary)]">
              Enjoyed this post?
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Subscribe to get new posts delivered to your inbox.
            </p>
            <Link
              href="/#newsletter"
              className="pill-button mt-4 inline-flex items-center gap-2 bg-[var(--accent)] px-6 py-3 text-black"
            >
              <Play size={14} fill="currentColor" />
              Subscribe
            </Link>
          </div>
        </div>

        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-24 rounded-xl bg-[var(--surface)] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[1.4px] text-[var(--text-secondary)]">
              On this page
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Table of contents coming soon.
            </p>
          </div>
        </aside>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 border-t border-[var(--surface-mid)] pt-8">
          <h2 className="title-font mb-5 text-xl font-bold text-[var(--text-primary)]">
            Related posts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} size="small" />
            ))}
          </div>
        </section>
      )}
    </article>
    </>
  )
}
