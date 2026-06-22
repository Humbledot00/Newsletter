import React, { Suspense } from "react"
import LoginClient from "@/components/admin/LoginClient"

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginClient />
    </Suspense>
  )
}
