import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import Link from "next/link"
import { Play } from "lucide-react"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grain-bg min-h-screen">
      <Navbar />
      <main className="min-h-[calc(100vh-10rem)] pb-20 md:pb-24">{children}</main>
      <Footer />
    </div>
  )
}
