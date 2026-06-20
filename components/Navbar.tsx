"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, Library, Menu, Radio, Search, X } from "lucide-react"
import { SITE_NAME } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/posts", label: "Posts", icon: Library },
  { href: "/about", label: "About", icon: Radio },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? "border-b border-[var(--surface-mid)] bg-[rgba(18,18,18,0.9)] backdrop-blur"
            : "bg-[var(--background)]"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 sm:px-6">
          <button
            className="rounded-full bg-[var(--surface-mid)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="hidden md:flex md:items-center md:gap-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`pill-button inline-flex items-center gap-2 px-4 py-2 ${
                    active
                      ? "bg-[var(--text-primary)] text-black"
                      : "bg-[var(--surface-mid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          <Link
            href="/"
            className="title-font text-base font-bold tracking-[0.5px] text-[var(--text-primary)]"
          >
            {SITE_NAME}
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/posts"
              className="spotify-input focus-ring hidden h-10 w-[280px] items-center gap-3 px-4 text-sm text-[var(--text-secondary)] lg:flex"
            >
              <Search size={15} />
              <span>Browse posts</span>
            </Link>

            <Link
              href="/#newsletter"
              className="pill-button bg-[var(--accent)] px-4 py-3 text-black"
            >
              Subscribe
            </Link>
          </div>
        </nav>
      </header>

      <div className="md:hidden">
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--surface-mid)] bg-[var(--surface)] px-4 py-2">
          <ul className="grid grid-cols-3 gap-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center justify-center rounded-lg py-2 text-[11px] font-semibold uppercase tracking-[0.8px] ${
                      active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed left-0 right-0 top-16 z-30 border-y border-[var(--surface-mid)] bg-[var(--surface)] px-4 py-4 md:hidden">
          <ul className="space-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-full px-4 py-2 text-sm ${
                    pathname === href
                      ? "bg-[var(--surface-mid)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#newsletter"
                className="pill-button mt-2 inline-flex w-full justify-center bg-[var(--accent)] px-4 py-3 text-black"
              >
                Subscribe
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
