"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken, getMe, setStoredUser } from "@/lib/auth"
import { Suspense } from "react"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")

    if (token) {
      setToken(token)
      // Fetch user info and redirect
      getMe()
        .then((user) => {
          setStoredUser(user)
          if (user.role === "admin") {
            router.replace("/admin")
          } else {
            router.replace("/agents")
          }
        })
        .catch(() => {
          router.replace("/login?error=oauth_failed")
        })
    } else {
      router.replace("/login?error=no_token")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">A autenticar...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
