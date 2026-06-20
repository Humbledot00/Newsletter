"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3 rounded-md p-1.5 text-[#a1a1a0] transition-colors hover:bg-[#2e2e2c] hover:text-[#f2f2f0]"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}
