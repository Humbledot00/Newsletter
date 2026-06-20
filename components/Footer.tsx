import Link from "next/link"
import { SITE_NAME } from "@/lib/utils"

const FOOTER_LINKS = [
  { href: "/posts", label: "Posts" },
  { href: "/#newsletter", label: "Newsletter" },
  { href: "/about", label: "About" },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--surface-mid)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="title-font text-sm font-bold tracking-[1px] uppercase">
              {SITE_NAME}
            </Link>
            <p className="mt-2 max-w-md text-xs text-[var(--text-secondary)]">
              Built for dense reading and fast publishing. New drops land in your inbox.
            </p>
          </div>

          <nav>
            <ul className="flex flex-wrap gap-2">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="pill-button inline-flex bg-[var(--surface-mid)] px-4 py-2 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-6 text-xs text-[var(--text-secondary)]">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
