/**
 * Format a date string for display.
 * e.g. "May 6, 2026"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Truncate a string to a given length, appending ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + "…"
}

/**
 * Return absolute URL for a given path using NEXT_PUBLIC_SITE_URL.
 */
export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`
}

/**
 * Site name from env, with a sensible default.
 */
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Shreyas's Newsletter"
