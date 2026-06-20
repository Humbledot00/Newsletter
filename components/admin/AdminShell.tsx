"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { Menu, LogOut, ExternalLink } from "lucide-react"
import { Sidebar } from "@/components/admin/Sidebar"
import { SITE_NAME } from "@/lib/utils"

export function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--surface-mid)] md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--surface-mid)] px-4 py-4">
            <span className="title-font text-sm font-bold uppercase tracking-[1.2px] text-[var(--text-primary)]">
              {SITE_NAME}
            </span>
            <span className="ml-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px] text-black">
              Admin
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </aside>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--surface-mid)] transition-transform duration-200 md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar mobile onClose={() => setDrawerOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--surface-mid)] bg-[var(--surface)] px-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-full bg-[var(--surface-mid)] p-1.5 text-[var(--text-secondary)] md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <span className="text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)] md:hidden">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-button flex items-center gap-1.5 bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-secondary)]"
            >
              <ExternalLink size={12} />
              View site
            </a>

            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Admin"}
                width={28}
                height={28}
                className="rounded-full"
              />
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="pill-button flex items-center gap-1.5 bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-secondary)]"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
