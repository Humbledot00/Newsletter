import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[2px] text-[var(--text-secondary)]">404</p>
      <h1 className="title-font mt-2 text-4xl font-bold text-[var(--text-primary)]">Track Not Found</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">The page you requested does not exist.</p>
      <Link
        href="/"
        className="pill-button mt-6 inline-flex bg-[var(--accent)] px-6 py-3 text-black"
      >
        Back Home
      </Link>
    </div>
  )
}
