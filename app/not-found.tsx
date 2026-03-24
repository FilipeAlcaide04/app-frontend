"use client"

import { Button } from "@/components/ui/button"
import { Home, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-4xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Desculpa, a página que procuras não existe ou foi movida. Volta ao início e continua explorando.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Voltar ao Início
            </Button>
          </Link>
          <Link href="/agents">
            <Button variant="outline" className="gap-2">
              Ver Agentes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
