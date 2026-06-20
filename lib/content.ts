import matter from "gray-matter"

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  [key: string]: unknown
}

export interface ParsedPost {
  frontmatter: PostFrontmatter
  content: string
}

export interface ValidationError {
  line: number
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Fetch raw markdown content from a raw GitHub URL.
 * Only raw.githubusercontent.com URLs are allowed.
 */
export async function fetchPostContent(url: string): Promise<string> {
  const parsed = new URL(url)
  if (parsed.hostname !== "raw.githubusercontent.com") {
    throw new Error("Only raw.githubusercontent.com URLs are supported")
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "text/plain",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("text")) {
    throw new Error("URL does not point to a text file")
  }

  return response.text()
}

/**
 * Parse raw markdown string into frontmatter + body content.
 */
export function parsePost(raw: string): ParsedPost {
  const { data, content } = matter(raw)
  return {
    frontmatter: data as PostFrontmatter,
    content,
  }
}

/**
 * Validate frontmatter and content against acceptance rules.
 */
export function validatePost(
  frontmatter: PostFrontmatter,
  content: string
): ValidationResult {
  const errors: ValidationError[] = []

  // Required frontmatter fields
  if (!frontmatter.title || String(frontmatter.title).trim() === "") {
    errors.push({ line: 0, message: "Missing required frontmatter field: title" })
  }
  if (!frontmatter.description || String(frontmatter.description).trim() === "") {
    errors.push({ line: 0, message: "Missing required frontmatter field: description" })
  }
  if (!frontmatter.date) {
    errors.push({ line: 0, message: "Missing required frontmatter field: date" })
  } else if (isNaN(Date.parse(String(frontmatter.date)))) {
    errors.push({ line: 0, message: "Frontmatter 'date' is not a valid ISO date string" })
  }

  // Content checks
  const lines = content.split("\n")
  let inCodeBlock = false

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Track code fence state
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock
    }

    if (!inCodeBlock) {
      // Check for relative image paths (should be absolute for external hosting)
      const imgMatch = line.match(/!\[.*?\]\((.*?)\)/)
      if (imgMatch && imgMatch[1]) {
        const src = imgMatch[1].split(" ")[0] // strip title attribute
        if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("/")) {
          errors.push({
            line: lineNum,
            message: `Image at line ${lineNum} uses a relative path '${src}' — use an absolute URL instead`,
          })
        }
      }

      // Check for empty link hrefs
      const linkMatch = line.match(/\[.*?\]\(\s*\)/)
      if (linkMatch) {
        errors.push({
          line: lineNum,
          message: `Empty link href at line ${lineNum}`,
        })
      }
    }
  })

  // Unclosed code block
  if (inCodeBlock) {
    errors.push({
      line: lines.length,
      message: `Unclosed code block — missing closing \`\`\``,
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Calculate estimated reading time in minutes.
 */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Generate a URL-safe slug from a title string.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
