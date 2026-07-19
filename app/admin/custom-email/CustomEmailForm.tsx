"use client"

import { useState, useTransition } from "react"

type SubscriberOption = {
  id: string
  email: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CustomEmailForm({
  subscribers,
}: {
  subscribers: SubscriberOption[]
}) {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [extraEmails, setExtraEmails] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleSubscriber(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  function handleSelectAll() {
    setSelectAll(true)
    setSelectedIds(subscribers.map((subscriber) => subscriber.id))
  }

  function handleClearSelection() {
    setSelectAll(false)
    setSelectedIds([])
  }

  function parseExtraEmails(raw: string) {
    return raw
      .split(/[\s,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  }

  function validateExtraEmails(emails: string[]) {
    return emails.every((email) => EMAIL_RE.test(email))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus("idle")

    const trimmedSubject = subject.trim()
    const trimmedBody = body.trim()
    const extra = parseExtraEmails(extraEmails)

    if (!trimmedSubject) {
      setError("Please enter an email subject.")
      return
    }

    if (!trimmedBody) {
      setError("Please enter an email body.")
      return
    }

    if (selectedIds.length === 0 && extra.length === 0) {
      setError("Select at least one subscriber or enter an email address.")
      return
    }

    if (extra.length > 0 && !validateExtraEmails(extra)) {
      setError("One or more additional email addresses are invalid.")
      return
    }

    setStatus("sending")
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/custom-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: trimmedSubject,
            body: trimmedBody,
            subscriberIds: selectedIds,
            extraEmails: extra,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error ?? "Failed to send email")
        }

        setStatus("sent")
        setError(null)
      } catch (err) {
        setStatus("error")
        setError(err instanceof Error ? err.message : "Something went wrong")
      }
    })
  }

  return (
    <div className="space-y-6 rounded-xl bg-[var(--surface)] p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Send a Custom Email</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Use the same newsletter-style email wrapper. Body text may include HTML markup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="custom-subject" className="mb-2 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="custom-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="spotify-input focus-ring h-11 w-full border-0 px-5 text-sm text-[var(--text-primary)]"
            placeholder="Newsletter update: what's new"
          />
        </div>

        <div>
          <label htmlFor="custom-body" className="mb-2 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            Email body <span className="text-red-500">*</span>
          </label>
          <textarea
            id="custom-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={12}
            className="focus-ring w-full resize-none rounded-lg border-0 bg-[var(--surface-mid)] px-4 py-3 text-sm text-[var(--text-primary)]"
            placeholder="Enter the content of your email here. HTML is supported."
          />
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Tip: You can include inline HTML such as <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, and <code>&lt;a href=&quot;...&quot;&gt;</code>.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl bg-[var(--surface)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">Subscribers</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="pill-button bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-primary)]"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="pill-button bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-primary)]"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {subscribers.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No active subscribers found.</p>
              ) : (
                subscribers.map((subscriber) => (
                  <label
                    key={subscriber.id}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--surface-mid)] px-3 py-3 text-sm text-[var(--text-primary)] hover:border-[var(--accent)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(subscriber.id)}
                      onChange={() => toggleSubscriber(subscriber.id)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>{subscriber.email}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--surface)] p-4">
            <label htmlFor="custom-extra-emails" className="mb-2 block text-xs font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
              Additional recipients
            </label>
            <textarea
              id="custom-extra-emails"
              value={extraEmails}
              onChange={(event) => setExtraEmails(event.target.value)}
              rows={6}
              className="focus-ring w-full resize-none rounded-lg border-0 bg-[var(--surface-mid)] px-4 py-3 text-sm text-[var(--text-primary)]"
              placeholder="Add emails separated by commas, semicolons, or new lines"
            />
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Enter individual addresses for recipients not in your active subscriber list.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl bg-[var(--surface-mid)] px-4 py-3 text-sm text-[var(--text-negative)]">{error}</div>
        ) : null}

        {status === "sent" ? (
          <div className="rounded-xl bg-[var(--surface-mid)] px-4 py-3 text-sm text-[var(--text-primary)]">
            Custom email sent successfully.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="pill-button bg-[var(--accent)] px-6 py-3 text-[10px] text-black disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Send Custom Email"}
          </button>
          <span className="text-xs text-[var(--text-secondary)]">
            Selected: {selectedIds.length} subscriber{selectedIds.length === 1 ? "" : "s"}
          </span>
        </div>
      </form>
    </div>
  )
}
