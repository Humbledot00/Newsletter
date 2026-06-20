import { CopyButton } from "./CopyButton"

interface CodeBlockProps {
  children: string
  className?: string
}

/**
 * Wraps a <pre><code> block with a relative-positioned container
 * so the CopyButton can be absolutely positioned inside it.
 */
export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <div className="relative">
      <CopyButton code={children} />
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}
