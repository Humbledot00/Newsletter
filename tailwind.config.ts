import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-mid": "var(--surface-mid)",
        border: "var(--border-color)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        title: ["var(--font-title)", "var(--font-ui)", "sans-serif"],
      },
      maxWidth: {
        reading: "780px",
      },
      lineHeight: {
        body: "1.4",
        heading: "1.15",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--text-primary)",
            a: {
              color: "var(--accent)",
              "&:hover": { color: "var(--accent)" },
            },
            "h1,h2,h3,h4": {
              color: "var(--text-primary)",
              lineHeight: "1.15",
              fontFamily: "var(--font-title)",
            },
            blockquote: {
              borderLeftColor: "var(--border-light)",
              color: "var(--text-secondary)",
            },
            code: {
              color: "#FDFDFD",
              backgroundColor: "#181818",
              borderRadius: "0.25rem",
              padding: "0.1rem 0.3rem",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            pre: {
              backgroundColor: "#181818",
              color: "#FDFDFD",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
