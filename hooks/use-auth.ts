"use client"

import { useState, useEffect, useCallback } from "react"
import { User, getToken, getStoredUser, getMe, logout as doLogout } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    // Try stored user first for instant UI
    const stored = getStoredUser()
    if (stored) setUser(stored)

    // Verify with server
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        doLogout()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    doLogout()
  }, [])

  const refresh = useCallback(async () => {
    try {
      const u = await getMe()
      setUser(u)
    } catch {
      logout()
    }
  }, [logout])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    logout,
    refresh,
  }
}
