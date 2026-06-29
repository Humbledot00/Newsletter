---
title: "How this newsletter platform is built"
description: "A walkthrough of the architecture behind this Next.js-powered newsletter app, from content ingestion to publishing and email delivery."
date: "2026-06-29"
author: "Copilot"
tags:
  - nextjs
  - architecture
  - newsletter
  - typescript
categories:
  - engineering
  - product
cover_image_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
---

This project is a small but complete publishing system for a modern newsletter. It has two main faces:

- a public site where readers can browse posts, subscribe, and read content
- an admin area where a single editor can import Markdown posts, configure metadata, and publish them

What makes it interesting is that the app is not just a blog. It combines a content pipeline, a database-backed publishing workflow, authentication, and email delivery into one cohesive Next.js application.

## The core stack

The app is built with:

- Next.js 15 with the App Router
- React 19 and TypeScript
- Tailwind CSS for styling
- Neon Postgres for storage
- NextAuth.js for admin authentication
- Nodemailer for transactional email
- Gray-matter and MDX tooling for content parsing and rendering

The overall shape is very typical of a modern full-stack product: server-rendered pages for the public experience, server actions for publishing operations, and route handlers for API endpoints.

## Project structure at a glance

The codebase is organized around clear responsibilities:

- app/ contains the route-based UI for the public site, admin dashboard, and API endpoints
- components/ holds reusable UI like cards, forms, navigation, and admin shell elements
- lib/ contains the system glue: database access, authentication, content parsing, and action helpers
- content/posts/ stores example Markdown content that can be imported into the system
- migrations/ contains the initial SQL schema for PostgreSQL

That structure keeps the app readable. The public experience lives in one part of the tree, the admin experience in another, and the shared backend logic is grouped in lib/.

## The public site

The public experience is intentionally simple and content-focused. Visitors can:

- land on a homepage that highlights featured and latest posts
- browse all published posts in a paginated catalog
- read individual posts with rich Markdown rendering, syntax highlighting, and metadata
- subscribe to the newsletter through a form
- manage their subscription via confirmation and unsubscribe flows

The homepage and posts pages are server components, so they can fetch data directly from the database and render metadata and content efficiently. Pages are also set up with revalidation so the site refreshes periodically rather than staying stale indefinitely.

## The content model

Posts are stored in a PostgreSQL table with fields for:

- title and slug
- description and author
- status such as draft, published, or scheduled
- publish date and featured flag
- tags and categories
- the content snapshot that is rendered on the site
- the original source URL for the imported Markdown file

This is a good fit for a publishing workflow because the database stores the editorial state while the content itself is captured as a snapshot. That means the app can render posts reliably even if the original source file changes later.

## How content gets into the app

One of the most interesting parts of this project is the import workflow.

An admin starts by pasting a raw GitHub URL into the Add Post form. The app then sends that URL to an internal validation endpoint, which:

1. fetches the remote Markdown file
2. parses the frontmatter and body
3. validates required fields and content rules
4. returns a preview of the post

If the preview looks good, the editor can continue to a configuration form, where they can set the slug, description, tags, categories, status, and publish options. Once saved, the post is written into the database and can be published.

That workflow makes the app feel very practical. Content is authored elsewhere, but the editorial experience remains centralized and controlled inside the application.

## Rendering Markdown and MDX-style content

Post content is rendered with a Markdown pipeline built around:

- gray-matter for parsing frontmatter
- remark-gfm for GitHub-flavored Markdown features
- rehype-highlight for syntax highlighting
- rehype-sanitize for safe HTML handling

The rendering layer is designed to be safe and readable. Code blocks are enhanced, markdown tables and lists work as expected, and potentially dangerous HTML is stripped out before it reaches the browser.

## Admin workflow

The admin area is protected by NextAuth and a middleware layer. Only authenticated users who match the configured admin email can access the dashboard. The middleware intercepts requests to /admin and redirects unauthenticated visitors to the login page.

Once inside the admin dashboard, the editor can:

- view stats for published posts, drafts, scheduled posts, and subscribers
- browse recent posts
- open the post management screen
- create or edit posts
- publish or unpublish content
- send a test email for a post

The admin UI is built as a separate shell with a sidebar and a dedicated layout, giving the editing experience a clear boundary from the public site.

## Subscription and email system

The newsletter experience is powered by the subscribers table and the email action layer.

Users subscribe via a form that sends a POST request to an API route. The route validates the email, applies a simple rate limit, and creates a pending subscriber record. A confirmation email is then sent with a unique token.

When the user clicks the confirmation link, the app marks the subscriber as active. Later, when a post is published, the app sends out a broadcast email to all active subscribers. This uses a Gmail SMTP setup through Nodemailer and includes an unsubscribe link in each message.

That gives the platform a complete lifecycle:

- subscribe
- confirm
- receive content
- unsubscribe if desired

## SEO and content discovery

The project also includes foundational SEO support. It generates:

- metadata for pages and posts
- Open Graph and Twitter tags
- a sitemap
- an RSS feed
- robots.txt rules

This is important because the product is not just an internal dashboard. It is designed to be discoverable and shareable as a real publication.

## Styling and design language

The visual design is heavily inspired by dark, immersive interfaces with rounded controls and strong contrast. The styling system uses Tailwind with CSS variables, so the app can keep a consistent theme across public pages, admin screens, and components.

The design is dense and editorial rather than airy. Cards, panels, buttons, and inputs all follow a coherent dark palette that makes the content feel central.

## Data and persistence

The database layer is intentionally straightforward. There are three primary tables in the initial migration:

- posts for editorial content
- subscribers for newsletter recipients
- page_views for future analytics behavior

The app talks to Neon Postgres through the serverless database client, and the query logic sits in a central database helper module. That keeps the data access layer consistent and avoids scattering SQL throughout the app.

## Why this architecture works well

This project is built around a practical editorial workflow:

- content is authored in Markdown
- the app validates and imports it
- the editor configures publication details
- the system stores it in a database
- the public site renders it with SEO and rich formatting
- subscribers receive emails when new posts go live

It is not over-engineered. Instead, it focuses on the core job of a newsletter platform: publish, distribute, and make content easy to read.

If you want to understand the project quickly, the best mental model is this: it is a Next.js app with a content publishing backend, a protected admin console, and a lightweight email newsletter engine built around one database.
