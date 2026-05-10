"use client"

import { AuthNavbar } from "@/components/auth-navbar"
import { AuthGuard } from "@/components/auth-guard"
import { StarField } from "@/components/star-field"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <StarField />
          <div className="absolute top-32 -left-32 w-96 h-96 rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute -top-20 right-20 w-72 h-72 rounded-full bg-accent/3 blur-3xl" />
          <div className="absolute bottom-40 left-1/3 w-80 h-80 rounded-full bg-primary/3 blur-3xl opacity-50" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-accent/2 blur-3xl" />
        </div>
        {/* Content */}
        <div className="relative z-10">
          <AuthNavbar />
          <main>{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
