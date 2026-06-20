# Newsletter App Project Plan

## Project Overview

This project is a newsletter publishing platform built with Next.js.

Current publishing workflow: - Single admin user - Content stored as
Markdown/MDX files in Git repositories - Admin writes and publishes
posts - Readers can browse and read content - Readers can subscribe to
receive email notifications when new posts are published

Primary goals: - Fast publishing workflow - SEO-optimized content
pages - Newsletter subscription and email notifications - Incremental
feature rollout

------------------------------------------------------------------------

## Tech Stack

-   Next.js
-   TypeScript
-   Tailwind CSS
-   Markdown / MDX (`next-mdx-remote`)
-   Git-based content management
-   PostgreSQL via Neon (serverless, free tier — works natively with Vercel)
-   Resend (email provider — free tier: 3,000 emails/month, 100/day)
-   NextAuth.js with GitHub OAuth (admin authentication)
-   Vercel (deployment)

------------------------------------------------------------------------

## Initial Release (V1)

### V1 Release Phases

**V1.0 — Basic Setup**
Core infrastructure. Minimal but functional end-to-end.

-   Project scaffolding (Next.js + TypeScript + Tailwind CSS)
-   Git-based content loading (read MDX/MD files from repository)
-   Public pages: Homepage, post listing, single post page
-   Basic admin dashboard with protected route
-   Admin authentication (see Admin Authentication section)
-   Deployment on Vercel

**V1.1 — Publishing Workflow + Newsletter**

-   Post configuration and publishing control from admin
-   Draft / publish / schedule support
-   Email subscription form + double opt-in
-   Send email on publish
-   SEO basics (meta tags, Open Graph, sitemap, RSS)

**V1.2 — Media, Search & Analytics**

-   Media management (cover image, inline images, optimization)
-   Markdown and frontmatter validation
-   Subscriber management
-   Analytics: page views, popular posts, subscriber growth
-   Search, categories, tag pages, pagination, related posts

------------------------------------------------------------------------

### Content Workflow

This is the end-to-end flow from writing to publish:

**URL-based flow (primary):**
```
Author writes MDX locally
→ pushes to GitHub
→ copies raw file URL (e.g. raw.githubusercontent.com/...)
→ pastes URL in admin "Add Post" form
→ app fetches markdown from URL
→ validates frontmatter + markdown
→ renders preview
→ author fills metadata form
→ publish
  → save content snapshot to DB
  → store metadata to DB
  → trigger email send to subscribers
  → revalidateTag('posts')
```

**Directory scan flow (alternative / future):**
```
content/posts/YYYY/MM/filename.mdx  ← conventional path structure
Admin clicks "Sync from Git"
→ app scans content/posts/ directory
→ parses frontmatter from each file
→ validates against acceptance rules
→ registers new/changed files as post drafts
```

**File acceptance rules (applies to both flows):**
-   File must be `.md` or `.mdx`
-   Must contain valid frontmatter with required fields: `title`, `description`, `date`
-   `date` must be a valid ISO date string
-   File must not already be registered (deduplication by URL or path)
-   Content must pass markdown syntax validation
-   No broken image references (images must exist or use absolute URLs)

------------------------------------------------------------------------

### Content Management

Post content is authored and committed as Markdown/MDX files in Git. The admin does not create or edit post content — the admin selects, configures, and controls publishing of Git-managed files.

Admin controls:

-   Register / link a Git file as a post
-   Configure post metadata
-   Set post status: draft / published
-   Schedule publishing
-   Mark as featured
-   Assign categories and tags
-   Slug assignment

Metadata fields: - title - description - author - publish date - cover
image - tags - categories

### Markdown Features

-   Fetch markdown from raw GitHub URL
-   Full page preview before publishing (rendered view, read-only)
-   Markdown syntax validation
-   Frontmatter validation
-   Validation errors with line numbers
-   Missing asset validation
-   Broken link detection

### Media Management

-   Cover image upload
-   Inline image upload
-   Image preview
-   Image optimization
-   Alt text support

### Publishing Workflow

-   Save draft
-   Preview before publish
-   Publish confirmation
-   Detect new published post
-   Revalidate affected pages using Next.js ISR (`revalidatePath` / `revalidateTag`)

### Admin Authentication

Single admin user in V1. Using **NextAuth.js with GitHub OAuth**.

-   GitHub OAuth as the sole provider
-   Sign-in is restricted to a single whitelisted email via `ADMIN_EMAIL` env var checked in the `signIn` callback
-   NextAuth handles sessions, cookies, and CSRF protection
-   All `/admin` routes protected via middleware session check
-   Extendable in future versions by whitelisting additional emails or switching to a DB role check

### Newsletter Features

-   Email subscription form
-   Double opt-in
-   Email verification
-   Unsubscribe support
-   Subscriber management
-   Subscriber count

### Email Notifications

-   Send email on publish
-   Email preview
-   Test email sending
-   Subject customization
-   Post CTA link
-   Unsubscribe link

### SEO

-   Meta title
-   Meta description
-   Canonical URLs
-   Open Graph tags
-   Social preview images
-   Sitemap generation
-   robots.txt
-   RSS feed
-   Structured data

### Public Features

-   Homepage
-   Latest posts
-   Featured posts
-   Posts listing
-   Post detail page
-   Category pages
-   Tag pages
-   Search
-   Pagination
-   Related posts

### Analytics

-   Page views (custom DB-based counter — increment on each post page request)
-   Popular posts (ranked by view count)
-   Subscriber growth

> Email open rates and click rates require webhook integration with the email provider — deferred to post-V1.

### Security

-   Rate limiting (subscription form endpoint)
-   Email validation
-   Input sanitization
-   MDX sanitization (`next-mdx-remote` safe mode)

### Admin Dashboard

-   Dashboard overview
-   Draft count
-   Published count
-   Subscriber stats

------------------------------------------------------------------------

## Future Enhancements

### Multi-user Platform

-   Registration
-   Login/logout
-   Password reset
-   Email verification
-   User roles

Roles: - admin - editor - author - reader

### Author Features

-   Author dashboard
-   Personal drafts
-   Personal published posts
-   Author profile
-   Avatar
-   Social links

### Collaboration

-   Multi-author support
-   Draft sharing
-   Editorial review
-   Approval flow
-   Revision history
-   Version comparison

### Social Features

-   Comments
-   Replies
-   Nested comments
-   Likes
-   Bookmarks
-   Follow authors
-   Notifications

### Advanced Newsletter

-   Custom email templates
-   Drag-and-drop builder
-   Weekly digest
-   Scheduled campaigns
-   Segmentation
-   Subscriber groups
-   A/B testing
-   Campaign history

### Personalization

-   User interests
-   Topic preferences
-   Personalized recommendations
-   Custom feeds

### Discovery

-   Trending posts
-   Most read
-   Recommended posts
-   Advanced search

### Monetization

-   Paid subscriptions
-   Premium content
-   Membership tiers
-   Donations
-   Sponsorships
-   Affiliate links

### API & Integrations

-   Public API
-   Webhooks
-   Import/export
-   CMS integrations

### Mobile

-   PWA support
-   Push notifications
-   Offline reading

### AI Features

-   AI summaries
-   SEO suggestions
-   Tag suggestions
-   Grammar checking
-   Subject line suggestions

------------------------------------------------------------------------

## Development Roadmap

### Phase 1

Build core publishing platform: - markdown workflow - publishing -
preview - validation - subscriptions - email notifications - SEO

### Phase 2

Improve admin workflow: - dashboard - analytics - better authoring tools

### Phase 3

Expand platform: - multi-user - comments - profiles - advanced
newsletter tools

------------------------------------------------------------------------

## Key Constraints

-   Keep V1 simple
-   Avoid premature multi-user complexity
-   Optimize for fast deployment and SEO
-   Maintain Git-based content workflow
