"use client"

import { AuthNavbar } from "@/components/auth-navbar"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <AuthNavbar />
      {children}
    </AuthGuard>
  )
}
