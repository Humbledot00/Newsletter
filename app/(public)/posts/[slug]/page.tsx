import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { getPostBySlug, getRelatedPosts } from "@/lib/db"
import { readingTime } from "@/lib/content"
import { formatDate, absoluteUrl, SITE_NAME } from "@/lib/utils"
import { PostCard } from "@/components/PostCard"
import { CodeBlock } from "@/components/CodeBlock"
import { ReadingProgress } from "@/components/ReadingProgress"
import { TableOfContents } from "@/components/TableOfContents"

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
    img: ["src", "alt", "title", "loading", "decoding", "className"],
    code: ["className"],
    span: ["className"],
    div: ["className"],
  },
}

// MDX component overrides — this is what gives the main content block (the
// rendered markdown body) its own typographic identity, distinct from the
// surrounding chrome.
const mdxComponents = {
  h2: ({ id, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={id}
      className="title-font group relative mt-12 scroll-mt-28 border-t border-[var(--surface-mid)] pt-8 text-2xl font-bold leading-snug text-[var(--text-primary)] first:mt-0 first:border-t-0 first:pt-0 sm:text-3xl"
      {...props}
    >
      {id && (
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="absolute -left-5 top-9 font-mono text-base font-normal text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100 sm:top-10"
        >
          #
        </a>
      )}
      {children}
    </h2>
  ),
  h3: ({ id, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={id}
      className="title-font group relative mt-9 flex scroll-mt-28 items-center gap-2.5 text-xl font-bold text-[var(--text-primary)]"
      {...props}
    >
      <span className="h-4 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
      {children}
      {id && (
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="font-mono text-sm font-normal text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100"
        >
          #
        </a>
      )}
    </h3>
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-5 text-[15.5px] leading-[1.85] text-[var(--text-primary)] opacity-90 sm:text-base" {...props} />
  ),
  a: ({ href = "", children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="text-[var(--text-primary)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--accent)]"
        {...props}
      >
        {children}
      </a>
    )
  },
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 rounded-r-md border-l-2 border-[var(--accent)] bg-[var(--surface-mid)]/30 py-3 pl-5 pr-4 font-mono text-[13.5px] italic leading-relaxed text-[var(--text-secondary)]"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-5 list-disc space-y-2 pl-5 marker:text-[var(--accent)]" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="my-5 list-decimal space-y-2 pl-5 font-mono marker:font-mono marker:text-[var(--accent)]" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="pl-1 text-[15px] leading-[1.8] text-[var(--text-primary)] opacity-90" {...props} />
  ),
  hr: () => (
    <div className="my-10 flex items-center justify-center gap-3" role="separator">
      <span className="h-px flex-1 bg-[var(--surface-mid)]" />
      <span className="font-mono text-xs text-[var(--text-secondary)]">/* * */</span>
      <span className="h-px flex-1 bg-[var(--surface-mid)]" />
    </div>
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-md border border-[var(--surface-mid)]">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[var(--surface-mid)]/40" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border-b border-[var(--surface-mid)] px-4 py-2 font-mono text-[11px] uppercase tracking-[1px] text-[var(--text-secondary)]"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b border-[var(--surface-mid)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] opacity-90" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-[var(--text-primary)]" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="text-[var(--text-primary)] opacity-90" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded-sm border border-[var(--surface-mid)] bg-[var(--surface-mid)]/40 px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--accent)]"
      {...props}
    />
  ),
  img: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      src={src ?? ""}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className="my-6 rounded-lg border border-[var(--surface-mid)] object-cover shadow-sm"
      {...props}
    />
  ),
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

  // Lightweight "build stats" derived straight from the source markdown —
  // reframes the usual reading-time line around the content of this site.
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const sectionCount = (content.match(/^##\s+/gm) ?? []).length
  const codeBlockCount = Math.floor((content.match(/```/g) ?? []).length / 2)
  const sourceUrl = (post as unknown as { source_url?: string }).source_url

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
      <ReadingProgress />
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
              <div className="absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-[1.5px] text-white/85 backdrop-blur-sm">
                fig.01 — cover
              </div>
            </div>
          )}

          <header className="mb-7 rounded-xl bg-[var(--surface)] p-5 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="truncate font-mono text-[11px] text-[var(--text-secondary)]">
                <span className="text-[var(--accent)]">~/posts/</span>
                {post.slug}.mdx
                <span
                  className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-[var(--accent)] motion-reduce:animate-none"
                  aria-hidden="true"
                />
              </p>
              <span className="shrink-0 -rotate-2 rounded-sm border border-[var(--accent)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--accent)]">
                Published
              </span>
            </div>

            {post.tags?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-[var(--surface-mid)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="title-font text-3xl font-bold leading-heading text-[var(--text-primary)] sm:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[1px] text-[var(--text-secondary)]">
              {post.author && <span>{post.author}</span>}
              {post.author && post.publish_date && (
                <span className="text-[var(--surface-mid)]">/</span>
              )}
              {post.publish_date && (
                <time dateTime={post.publish_date}>
                  {formatDate(post.publish_date)}
                </time>
              )}
              <span className="text-[var(--surface-mid)]">/</span>
              <span>{minutes} min build</span>
              <span className="text-[var(--surface-mid)]">/</span>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </header>

          {/* Mobile / tablet contents — hidden on desktop, where the sidebar takes over */}
          <details className="mb-6 rounded-xl bg-[var(--surface)] p-5 lg:hidden">
            <summary className="cursor-pointer font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-secondary)]">
              Contents
            </summary>
            <div className="mt-3">
              <TableOfContents containerId="post-content" />
            </div>
          </details>

          <div
            id="post-content"
            className="max-w-none rounded-xl bg-[var(--surface)] p-5 sm:p-8"
          >
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [rehypeSanitize, sanitizeSchema],
                    rehypeSlug,
                    rehypeHighlight,
                  ],
                },
              }}
            />
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-[var(--surface-mid)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--surface-mid)] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-mid)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-mid)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-mid)]" />
              <span className="ml-2 font-mono text-[11px] uppercase tracking-[1.5px] text-[var(--text-secondary)]">
                subscribe.sh
              </span>
            </div>
            <div className="p-6 text-center sm:p-8">
              <h2 className="title-font text-xl font-bold text-[var(--text-primary)]">
                Enjoyed this post?
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Subscribe to get new posts delivered to your inbox.
              </p>
              <Link
                href="/#newsletter"
                className="pill-button mt-5 inline-flex items-center gap-2 bg-[var(--accent)] px-6 py-3 font-mono text-sm font-semibold text-black"
              >
                <span aria-hidden="true">$</span> subscribe --now
              </Link>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl bg-[var(--surface)] p-5">
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-secondary)]">
                Contents
              </p>
              <TableOfContents containerId="post-content" />
            </div>

            <div className="rounded-xl bg-[var(--surface)] p-5">
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-secondary)]">
                Build stats
              </p>
              <dl className="space-y-2 font-mono text-[11px] text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <dt>Sections</dt>
                  <dd className="text-[var(--text-primary)]">{sectionCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Code blocks</dt>
                  <dd className="text-[var(--text-primary)]">{codeBlockCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Words</dt>
                  <dd className="text-[var(--text-primary)]">{wordCount.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-dashed border-[var(--surface-mid)] p-5 font-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                View source →
              </a>
            )}
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