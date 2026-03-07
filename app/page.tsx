"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { AgentLegend } from "@/components/agent-legend"
import { Activity, Cpu } from "lucide-react"

// Dynamic imports for 3D components to avoid SSR issues
const Avatar3D = dynamic(
  () => import("@/components/avatar-3d").then((mod) => mod.Avatar3D),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder label="Avatar" />,
  }
)

const Brain3D = dynamic(
  () => import("@/components/brain-3d").then((mod) => mod.Brain3D),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder label="Cérebro" />,
  }
)

function LoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">A carregar {label}...</p>
      </div>
    </div>
  )
}

function StatusIndicator({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs text-foreground font-mono">{value}</span>
    </div>
  )
}

export default function ConsciousnessInterface() {
  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-background">
      {/* Top Status Bar */}
      <header className="fixed top-0 left-0 right-0 z-20 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 bg-card/50 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto min-h-9">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-semibold text-foreground">Consciência Artificial</h1>
              <p className="text-[10px] text-muted-foreground">Sistema de Agentes Cognitivos v1.0</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <StatusIndicator label="Estado" value="ATIVO" color="#00ff88" />
            <StatusIndicator label="Agentes" value="7/7" color="#00d4ff" />
            <StatusIndicator label="Memória" value="2.4GB" color="#aa00ff" />
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex h-[100dvh] pt-14">
        {/* Left Panel - Avatar */}
        <section className="w-full lg:w-1/2 h-full relative border-r border-border flex flex-col min-h-0">
          {/* Panel Label */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-xs text-foreground font-medium">Interface / Avatar</span>
          </div>

          {/* 3D Avatar */}
          <div className="flex-1 min-h-0">
            <Suspense fallback={<LoadingPlaceholder label="Avatar" />}>
              <Avatar3D />
            </Suspense>
          </div>

          {/* Chat Interface */}
          <div className="h-[clamp(210px,32vh,310px)] lg:h-[clamp(180px,28vh,240px)] bg-card/30 backdrop-blur-sm border-t border-border">
            <ChatInterface />
          </div>
        </section>

        {/* Right Panel - Brain */}
        <section className="hidden lg:block w-1/2 h-full relative min-h-0">
          {/* Panel Label */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-foreground font-medium">Cérebro / Emoções</span>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border hidden xl:block">
            <span className="text-[10px] text-muted-foreground">Arrasta para rodar • Scroll para zoom</span>
          </div>

          {/* 3D Brain */}
          <Suspense fallback={<LoadingPlaceholder label="Cérebro" />}>
            <Brain3D />
          </Suspense>

          {/* Agent Legend */}
          <AgentLegend />
        </section>
      </div>

      {/* Mobile Brain Toggle - shown only on small screens */}
      <div className="lg:hidden fixed z-30 bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]">
        <MobileBrainModal />
      </div>
    </main>
  )
}

function MobileBrainModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30"
      >
        <Cpu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-10 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-foreground font-medium">Cérebro / Emoções</span>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-10 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border text-xs text-foreground"
          >
            Fechar
          </button>

          <Suspense fallback={<LoadingPlaceholder label="Cérebro" />}>
            <Brain3D />
          </Suspense>

          <AgentLegend />
        </div>
      )}
    </>
  )
}
