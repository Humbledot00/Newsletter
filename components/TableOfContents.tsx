"use client"

import { useEffect, useState } from "react"

interface Heading {
  id: string
  text: string
  level: number
}

/**
 * Builds its list from the rendered h2/h3 elements inside `containerId`
 * (requires rehype-slug in the MDX pipeline so headings carry ids), then
 * tracks scroll position to highlight the active section.
 */
export function TableOfContents({ containerId }: { containerId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return

    const nodes = Array.from(container.querySelectorAll("h2, h3")) as HTMLElement[]
    const list = nodes
      .filter((n) => n.id)
      .map((n) => ({ id: n.id, text: n.textContent ?? "", level: n.tagName === "H3" ? 3 : 2 }))
    setHeadings(list)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-100px 0px -70% 0px" }
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [containerId])

  if (headings.length === 0) {
    return (
      <p className="font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">
        // no sections in this build
      </p>
    )
  }

  return (
    <nav aria-label="Table of contents" className="relative">
      <div
        className="absolute bottom-1 left-[3px] top-1 w-px bg-[var(--surface-mid)]"
        aria-hidden="true"
      />
      <ul className="space-y-1">
        {headings.map((h) => {
          const isActive = h.id === activeId
          return (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? 18 : 10 }}>
              <a
                href={`#${h.id}`}
                className={`relative block py-1 pl-3 text-[12.5px] leading-snug transition-colors ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span
                  className={`absolute -left-px top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-colors ${
                    isActive ? "bg-[var(--accent)]" : "bg-[var(--surface-mid)]"
                  }`}
                  aria-hidden="true"
                />
                {h.text.replace('#', "")}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}