import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveSubscribers } from "@/lib/db"
import CustomEmailForm from "./CustomEmailForm"

export default async function CustomEmailPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const subscribers = await getActiveSubscribers(100)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="title-font text-3xl font-bold text-[var(--text-primary)]">Custom Email</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Send a one-off email to your active subscribers and optional extra addresses.
        </p>
      </div>
      <CustomEmailForm subscribers={subscribers} />
    </div>
  )
}
