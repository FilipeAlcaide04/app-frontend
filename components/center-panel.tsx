"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { MessageCircle } from "lucide-react"
import { VRMClientOnly } from "@/components/vrm-client-only"
import { useVRMLipSync } from "@/components/vrm-avatar"
import { Avatar3D } from "@/components/avatar-3d"

export function CenterPanel() {
  const [vrmAvatar, setVrmAvatar] = useState<string | null>(null)
  const [vrm, setVrm] = useState<any>(null)
  const { speak } = useVRMLipSync(vrm)

  // Carregar avatar do servidor (API)
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const response = await fetch('/api/avatars/vrm')
        const data = await response.json()
        if (data.success && data.url) {
          setVrmAvatar(data.url)
        }
      } catch (error) {
        console.warn('[CenterPanel] Failed to load avatar from API:', error)
      }
    }

    loadAvatar()
  }, [])

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
          {vrmAvatar ? (
            <VRMClientOnly avatarUrl={vrmAvatar} onAvatarLoaded={setVrm} />
          ) : (
            <Avatar3D />
          )}
        </div>
      </div>

      {/* Chat Section - Lower Part */}
      <div className="h-[clamp(200px,30vh,300px)] bg-card/50 backdrop-blur-sm border-t border-border flex flex-col">
        <ChatInterface onBotMessage={speak} />
      </div>
    </section>
  )
}
