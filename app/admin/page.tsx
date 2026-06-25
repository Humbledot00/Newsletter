import { getAllSubscribers, getAdminStats, getRecentPosts } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { FileText, Users, BookOpen, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  return (
    <div className="rounded-xl bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]">{label}</p>
        <Icon size={16} className="text-[var(--text-secondary)]" />
      </div>
      <p className="title-font mt-2 text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

const STATUS_BADGE: Record<string, string> = {
  published: "bg-[var(--accent)] text-black",
  draft: "bg-[var(--text-warning)] text-black",
  scheduled: "bg-[var(--text-announcement)] text-black",
}

export default async function AdminDashboardPage() {
  const [stats, recentPosts, subscribers] = await Promise.all([
    getAdminStats(),
    getRecentPosts(5),
    getAllSubscribers(10),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="title-font text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Overview of your newsletter
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Posts" value={stats.published} icon={BookOpen} />
        <StatCard label="Drafts" value={stats.drafts} icon={FileText} />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Clock} />
        <StatCard label="Subscribers" value={stats.activeSubscribers} icon={Users} />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-font text-base font-bold text-[var(--text-primary)]">Recent Posts</h2>
          <Link href="/admin/posts" className="text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            View all
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl bg-[var(--surface)]">
          {recentPosts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No posts yet.</p>
              <Link
                href="/admin/posts/add"
                className="pill-button mt-3 inline-flex bg-[var(--accent)] px-5 py-3 text-[10px] text-black"
              >
                Add your first post
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--surface-mid)] text-left text-xs uppercase tracking-[1px] text-[var(--text-secondary)]">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-mid)]">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--surface-mid)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/configure?postId=${post.id}`}
                        className="font-medium text-[var(--text-primary)]"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.8px] ${STATUS_BADGE[post.status ?? "draft"] ?? ""}`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
                      {formatDate(post.publish_date ?? null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-font text-base font-bold text-[var(--text-primary)]">Subscribed Emails</h2>
          <span className="text-xs uppercase tracking-[1.2px] text-[var(--text-secondary)]">
            {stats.activeSubscribers} active
          </span>
        </div>

        <div className="overflow-hidden rounded-xl bg-[var(--surface)]">
          {subscribers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No subscribers yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--surface-mid)] text-left text-xs uppercase tracking-[1px] text-[var(--text-secondary)]">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-mid)]">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-[var(--surface-mid)]">
                    <td className={`px-4 py-3 font-medium ${subscriber.is_deleted ? "text-[var(--text-negative)]" : "text-[var(--text-primary)]"}`}>
                      {subscriber.email}
                    </td>
                    <td className="px-4 py-3 text-sm uppercase tracking-[0.9px] text-[var(--text-secondary)]">
                      {subscriber.is_deleted ? "deleted" : subscriber.status}
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
                      {formatDate(subscriber.subscribed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/add"
          className="pill-button bg-[var(--accent)] px-5 py-3 text-[10px] text-black"
        >
          Add Post
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-button bg-[var(--surface)] px-5 py-3 text-[10px] text-[var(--text-primary)]"
        >
          View site
        </a>
      </div>
    </div>
  )
}
