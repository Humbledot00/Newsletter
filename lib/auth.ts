import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase()
}

interface GithubEmail {
  email: string
  primary: boolean
  verified: boolean
  visibility: "public" | "private" | null
}

async function getGithubVerifiedEmail(accessToken: string): Promise<string | null> {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const emails = (await response.json()) as GithubEmail[]
  const primaryVerified = emails.find((entry) => entry.primary && entry.verified)
  if (primaryVerified) return primaryVerified.email

  const firstVerified = emails.find((entry) => entry.verified)
  return firstVerified?.email ?? null
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL)
      if (!adminEmail) {
        console.error("ADMIN_EMAIL env var is not set")
        return false
      }

      let candidateEmail = normalizeEmail(profile?.email)

      if (!candidateEmail && account?.provider === "github" && account.access_token) {
        const githubEmail = await getGithubVerifiedEmail(account.access_token)
        candidateEmail = normalizeEmail(githubEmail)
      }

      return candidateEmail === adminEmail
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
