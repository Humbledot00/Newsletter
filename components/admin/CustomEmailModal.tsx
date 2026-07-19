"use client"

import { useState } from "react"
import CustomEmailForm from "@/app/admin/custom-email/CustomEmailForm"

type SubscriberOption = {
  id: string
  email: string
}

export default function CustomEmailModal({ subscribers }: { subscribers: SubscriberOption[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="pill-button bg-[var(--surface)] px-5 py-3 text-[10px] text-[var(--text-primary)]"
      >
        Open Custom Email
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/50 p-4 pt-24 sm:p-6">
          <div className="w-full max-w-5xl rounded-3xl bg-[var(--background)] shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-[var(--surface-mid)] px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[var(--text-secondary)]">
                  Custom Email
                </p>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Send a one-off message</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="pill-button bg-[var(--surface-mid)] px-3 py-2 text-[10px] text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
            <div className="p-5">
              <CustomEmailForm subscribers={subscribers} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
