"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Users, Home, LogOut, Brain, ArrowLeft } from "lucide-react"
import { StarField } from "@/components/star-field"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [loading, user, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <StarField />
      </div>

      <div className="relative z-10">
        {/* Admin Navbar */}
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500/80 to-orange-500/60 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold">Admin Panel</span>
                  <p className="text-[10px] text-muted-foreground">Percore</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/agents">
                <Button variant="ghost" size="sm" className="gap-2 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao App
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/40 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
