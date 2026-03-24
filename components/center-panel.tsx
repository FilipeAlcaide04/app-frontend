"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { MessageCircle } from "lucide-react"

const Avatar3D = dynamic(
  () => import("@/components/avatar-3d").then((mod) => mod.Avatar3D),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder />,
  }
)

function LoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">A carregar agente...</p>
      </div>
    </div>
  )
}

export function CenterPanel() {
  return (
    <section className="w-full lg:w-[40%] h-full flex flex-col relative min-h-0 border-r border-border bg-gradient-to-br from-background/30 via-card/10 to-background/30 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50 transition-all hover:border-border hover:bg-card/90">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-foreground font-semibold">Conversa</span>
        </div>
      </div>

      {/* Avatar Section - Upper Part */}
      <div className="flex-1 min-h-0 mt-14 flex flex-col">
        <div className="flex-1 min-h-0">
          <Suspense fallback={<LoadingPlaceholder />}>
            <Avatar3D />
          </Suspense>
        </div>
      </div>

      {/* Chat Section - Lower Part */}
      <div className="h-[clamp(200px,30vh,300px)] bg-card/50 backdrop-blur-sm border-t border-border flex flex-col">
        <ChatInterface />
      </div>
    </section>
  )
}
