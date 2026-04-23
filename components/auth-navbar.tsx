"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Home,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Bell,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function AuthNavbar() {
  const pathname = usePathname()
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  const navItems = [
    { href: "/agents", label: "Agentes", icon: Brain },
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/settings", label: "Configurações", icon: Settings },
  ]

  if (!user) return null

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex glass-subtle backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/agents" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span>CA</span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-amber-400" title="Admin Panel">
                  <Shield className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-card/30">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground hidden lg:inline">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sair">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden glass-subtle backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/agents" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-4 py-3 space-y-2 border-t border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-white"
                        : "hover:bg-white/5 text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </Link>
              )
            })}
            <div className="border-t border-white/5 my-2 pt-2 space-y-2">
              {isAdmin && (
                <Link href="/admin">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors text-amber-400"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors text-red-400"
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
