"use client"

import { Suspense } from "react"
import { StarField } from "@/components/star-field"
import { LeftPanel } from "@/components/left-panel"
import { CenterPanel } from "@/components/center-panel"
import { RightPanel } from "@/components/right-panel"
import { AuthGuard } from "@/components/auth-guard"
import { Activity, Cpu } from "lucide-react"

function StatusIndicator({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-foreground font-mono font-semibold">{value}</span>
    </div>
  )
}

export default function ConsciousnessInterface() {
  return (
    <AuthGuard>
    <main className="min-h-[100dvh] w-full overflow-x-hidden relative">
      {/* Background com StarField */}
      <div className="fixed inset-0 z-0">
        <StarField />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 py-3 bg-gradient-to-b from-background/95 via-background/80 to-transparent backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between gap-3 max-w-full mx-auto">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center border border-primary/30">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-foreground">Consciência Artificial</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Sistema Neural Cognitivo</p>
              </div>
            </div>
            
            {/* Center: Status Indicators */}
            <div className="hidden md:flex items-center gap-2">
              <StatusIndicator label="Estado" value="ATIVO" color="#10b981" />
              <StatusIndicator label="Agentes" value="7/7" color="#06b6d4" />
              <StatusIndicator label="Memória" value="2.4GB" color="#a855f7" />
            </div>
            
            {/* Right: Online Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 ml-auto sm:ml-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline text-xs text-emerald-300 font-medium">Online</span>
              <Activity className="w-4 h-4 text-emerald-400 sm:hidden" />
            </div>
          </div>
        </header>

        {/* Main 3-Column Layout */}
        <div className="flex h-[100dvh] pt-16 gap-0">
          {/* Left Panel - Brain */}
          <LeftPanel />

          {/* Center Panel - Chat & Agent */}
          <CenterPanel />

          {/* Right Panel - Dashboard */}
          <RightPanel />
        </div>
      </div>
    </main>
    </AuthGuard>
  )
}
