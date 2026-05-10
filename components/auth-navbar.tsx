"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Brain,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function AuthNavbar() {
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  const navItems = [
    { href: "/agents", label: "Agentes", icon: Brain },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/settings", label: "Configurações", icon: Settings },
  ]

  if (!user) return null

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:block sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/agents" className="flex items-center gap-2 font-semibold text-sm">
                <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                fill="currentColor" viewBox="0 0 24 24" >
                <path d="M19.86 8.46c.09-.31.14-.64.14-.96 0-1.82-1.39-3.32-3.17-3.48A3.01 3.01 0 0 0 14 2c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78-1.3 0-2.41.83-2.83 2.01A3.51 3.51 0 0 0 4 7.5c0 .33.05.65.14.96C2.87 9.14 2 10.49 2 12c0 1.08.43 2.09 1.17 2.83-.11.38-.17.77-.17 1.17 0 1.96 1.41 3.59 3.31 3.93C6.86 21.16 8.11 22 9.5 22c.98 0 1.86-.41 2.5-1.06.64.65 1.52 1.06 2.5 1.06 1.39 0 2.63-.83 3.19-2.06A4.006 4.006 0 0 0 21 16c0-.4-.06-.79-.17-1.17.75-.75 1.17-1.76 1.17-2.83 0-1.5-.86-2.86-2.14-3.54M9.5 20c-.71 0-1.33-.5-1.47-1.2l-.21-.8H7c-1.1 0-2-.9-2-2 0-.35.08-.68.25-.98l.46-.82-.78-.51C4.35 13.31 4 12.68 4 12c0-.98.72-1.82 1.68-1.97l1.69-.26-1.06-1.35c-.2-.26-.32-.59-.32-.92 0-.83.67-1.5 1.5-1.5.11 0 .21.01.31.03l1.19.17V4.99c0-.55.45-1 1-1s1 .45 1 1v13.5c0 .83-.67 1.5-1.5 1.5Zm9.57-6.31-.78.51.46.82c.17.3.25.63.25.98 0 1.1-.9 2-2.05 2h-.82l-.16.8c-.14.69-.76 1.2-1.47 1.2-.83 0-1.5-.67-1.5-1.5V5c0-.55.45-1 1-1s1 .45 1 1.05v1.21l1.19-.22c.1-.02.21-.03.31-.03a1.498 1.498 0 0 1 1.18 2.42l-1.06 1.35 1.69.26c.96.15 1.68 1 1.68 1.97 0 .68-.35 1.32-.93 1.69Z"/>
                </svg>
              <span className="tracking-tight">Percore</span>
            </Link>

            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        active
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" title="Admin">
                  <Shield className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-border/50">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden lg:inline">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout} title="Sair" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile */}
      <nav className="md:hidden sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="px-4 h-12 flex items-center justify-between">
          <Link href="/agents" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Brain className="w-3 h-3 text-background" />
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="px-4 py-3 space-y-0.5 border-t border-border/50 bg-background">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                      active
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </Link>
              )
            })}
            <div className="border-t border-border/50 my-2 pt-2">
              {isAdmin && (
                <Link href="/admin">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-amber-400 text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
