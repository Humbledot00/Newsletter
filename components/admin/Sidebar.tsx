"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Plus, X } from "lucide-react"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/posts/add", label: "Add Post", icon: Plus },
]

interface SidebarProps {
  onClose?: () => void
  mobile?: boolean
}

export function Sidebar({ onClose, mobile = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-[var(--surface)] py-4">
      {mobile && (
        <div className="flex items-center justify-between border-b border-[var(--surface-mid)] px-4 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[1.4px] text-[var(--text-secondary)]">Menu</span>
          <button
            onClick={onClose}
            className="rounded-full bg-[var(--surface-mid)] p-1.5 text-[var(--text-secondary)]"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <nav className="mt-2 flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`pill-button flex items-center gap-2 rounded-full px-3 py-3 text-[10px] transition-colors ${
                    isActive
                      ? "bg-[var(--text-primary)] text-black"
                      : "bg-[var(--surface-mid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
