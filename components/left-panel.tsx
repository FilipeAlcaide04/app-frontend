"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Brain } from "lucide-react"

const Brain3D = dynamic(
  () => import("@/components/brain-3d").then((mod) => mod.Brain3D),
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
        <p className="text-muted-foreground text-sm">A carregar cérebro...</p>
      </div>
    </div>
  )
}

export function LeftPanel() {
  return (
    <section className="w-full lg:w-[35%] h-full flex flex-col relative min-h-0 border-r border-border">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-lg border border-border/50 transition-all hover:border-border hover:bg-card/80">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-foreground font-semibold">Cérebro Neural</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 z-10 bg-card/60 px-3 py-1.5 rounded-lg border border-border/50 hidden lg:block">
        <span className="text-[10px] text-muted-foreground font-medium">Arrasta • Scroll</span>
      </div>

      {/* 3D Brain - Takes most space */}
      <div className="flex-1 min-h-0 mt-14">
        <Suspense fallback={<LoadingPlaceholder />}>
          <Brain3D />
        </Suspense>
      </div>

    </section>
  )
}
