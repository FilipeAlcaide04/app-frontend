"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { StarField } from "@/components/star-field"
import { LeftPanel } from "@/components/left-panel"
import { CenterPanel } from "@/components/center-panel"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Activity, ArrowLeft, Cpu, LogOut } from "lucide-react"
import { Agent, getAgent, listAgents } from "@/lib/agents"

function StatusIndicator({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/30 border border-border/50 hover:bg-card/50 transition-colors">
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-foreground font-mono font-semibold">{value}</span>
    </div>
  )
}

function ConsciousnessContent() {
  const searchParams = useSearchParams()
  const agentIdParam = searchParams.get("agent")
  const { user, logout } = useAuth()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [agentList, setAgentList] = useState<Agent[]>([])
  const [agentLoading, setAgentLoading] = useState<boolean>(true)

  // Carregar lista de agentes do utilizador (para o seletor)
  useEffect(() => {
    let cancelled = false
    listAgents()
      .then((items) => {
        if (!cancelled) setAgentList(items)
      })
      .catch(() => {
        if (!cancelled) setAgentList([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Carregar o agente activo a partir do URL (ou o primeiro da lista)
  useEffect(() => {
    let cancelled = false
    setAgentLoading(true)

    const loadSelected = async () => {
      try {
        if (agentIdParam) {
          const a = await getAgent(agentIdParam)
          if (!cancelled) setAgent(a)
          return
        }
        // Fallback: primeiro agente activo da lista
        if (agentList.length > 0) {
          const first = agentList.find((a) => a.is_active) || agentList[0]
          if (!cancelled) setAgent(first)
          return
        }
        if (!cancelled) setAgent(null)
      } catch {
        if (!cancelled) setAgent(null)
      } finally {
        if (!cancelled) setAgentLoading(false)
      }
    }

    loadSelected()
    return () => {
      cancelled = true
    }
  }, [agentIdParam, agentList])

  const activeCount = agentList.filter((a) => a.is_active).length

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden relative">
      {/* Background com StarField */}
      <div className="fixed inset-0 z-0">
        <StarField />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 py-3 border-b border-border/50">
          <div className="flex items-center justify-between gap-3 max-w-full mx-auto">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
              fill="currentColor" viewBox="0 0 24 24" >
              <path d="M19.86 8.46c.09-.31.14-.64.14-.96 0-1.82-1.39-3.32-3.17-3.48A3.01 3.01 0 0 0 14 2c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78-1.3 0-2.41.83-2.83 2.01A3.51 3.51 0 0 0 4 7.5c0 .33.05.65.14.96C2.87 9.14 2 10.49 2 12c0 1.08.43 2.09 1.17 2.83-.11.38-.17.77-.17 1.17 0 1.96 1.41 3.59 3.31 3.93C6.86 21.16 8.11 22 9.5 22c.98 0 1.86-.41 2.5-1.06.64.65 1.52 1.06 2.5 1.06 1.39 0 2.63-.83 3.19-2.06A4.006 4.006 0 0 0 21 16c0-.4-.06-.79-.17-1.17.75-.75 1.17-1.76 1.17-2.83 0-1.5-.86-2.86-2.14-3.54M9.5 20c-.71 0-1.33-.5-1.47-1.2l-.21-.8H7c-1.1 0-2-.9-2-2 0-.35.08-.68.25-.98l.46-.82-.78-.51C4.35 13.31 4 12.68 4 12c0-.98.72-1.82 1.68-1.97l1.69-.26-1.06-1.35c-.2-.26-.32-.59-.32-.92 0-.83.67-1.5 1.5-1.5.11 0 .21.01.31.03l1.19.17V4.99c0-.55.45-1 1-1s1 .45 1 1v13.5c0 .83-.67 1.5-1.5 1.5Zm9.57-6.31-.78.51.46.82c.17.3.25.63.25.98 0 1.1-.9 2-2.05 2h-.82l-.16.8c-.14.69-.76 1.2-1.47 1.2-.83 0-1.5-.67-1.5-1.5V5c0-.55.45-1 1-1s1 .45 1 1.05v1.21l1.19-.22c.1-.02.21-.03.31-.03a1.498 1.498 0 0 1 1.18 2.42l-1.06 1.35 1.69.26c.96.15 1.68 1 1.68 1.97 0 .68-.35 1.32-.93 1.69Z"/>
              </svg>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-foreground">Percore</h1>
              </div>
            </div>

            {/* Center: Status Indicators */}
            <div className="hidden md:flex items-center gap-2">

 
            </div>

            {/* Right: Navigation + Session */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-300 font-medium">Online</span>
              </div>

              <Link href="/agents">
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Agentes</span>
                </Button>
              </Link>

              {user && (
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-card/30 border border-border/40">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-muted-foreground max-w-32 truncate">{user.name}</span>
                </div>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>

              <Activity className="w-4 h-4 text-emerald-400 lg:hidden" />
            </div>
          </div>
        </header>

        {/* Main 2-Column Layout */}
        <div className="flex h-[100dvh] pt-16 gap-0 min-w-0 overflow-hidden">
          {/* Left Panel - Brain */}
          <LeftPanel />

          {/* Center Panel - Avatar & Chat */}
          <CenterPanel
            agent={agent}
            agents={agentList}
            loading={agentLoading}
          />
        </div>
      </div>
    </main>
  )
}

export default function ConsciousnessInterface() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <ConsciousnessContent />
      </Suspense>
    </AuthGuard>
  )
}
