"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit2,
  Share2,
  Trash2,
  Play,
  BarChart3,
  Clock,
  MessageSquare,
  TrendingUp,
  Settings,
  Copy,
  Download,
} from "lucide-react"

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>()
  const [isEditing, setIsEditing] = useState(false)

  // Mock agent data
  const agent = {
    id: params.id ?? "",
    name: "Analisador Lógico",
    emoji: "🧠",
    description: "Especializado em análise crítica e resolução de problemas complexos com pensamento estruturado",
    type: "logic",
    status: "active",
    created: "2024-01-15",
    lastActive: "há 2 min",
    conversations: 847,
    performance: 94,
    successRate: 92,
    averageResponseTime: "1.2s",
    systemPrompt:
      "Você é um analisador lógico especializado em quebrar problemas complexos em componentes gerenciáveis. Você pensa estruturadamente, considera múltiplas perspectivas e fornece soluções baseadas em evidências.",
    knowledgeBases: 5,
    trainingDataSize: "2.4GB",
    version: "2.1.0",
    lastUpdated: "2024-03-15",
  }

  const recentConversations = [
    { id: 1, topic: "Estratégia de marketing", duration: "12 min", date: "Hoje" },
    { id: 2, topic: "Análise de dados", duration: "8 min", date: "Ontem" },
    { id: 3, topic: "Resolução de problemas", duration: "15 min", date: "2 dias atrás" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      {/* Header */}
      <div className="border-b border-border/30 glass-subtle backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-lg -ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                <Share2 className="w-4 h-4" />
                Partilhar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Executar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent overview card */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-6xl">{agent.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Ativo
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Lógico
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>
                  <p className="text-sm text-muted-foreground/80">{agent.description}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                <div>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">Conversas</p>
                  <p className="text-2xl font-bold">{agent.conversations}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">Performance</p>
                  <p className="text-2xl font-bold">{agent.performance}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">Taxa Sucesso</p>
                  <p className="text-2xl font-bold">{agent.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">Tempo Resp.</p>
                  <p className="text-2xl font-bold">{agent.averageResponseTime}</p>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
              <div className="bg-background/50 rounded-lg p-4 border border-white/5 text-sm text-muted-foreground/80 font-mono">
                {agent.systemPrompt}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button size="sm" variant="outline" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Conversas Recentes</h3>
              <div className="space-y-3">
                {recentConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-3 bg-white/2 rounded-lg border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">{conv.topic}</p>
                      <p className="text-xs text-muted-foreground">{conv.date}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{conv.duration}</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todas
              </Button>
            </div>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Information */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Informações</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground/60 mb-1">Criado em</p>
                  <p className="font-medium">{agent.created}</p>
                </div>
                <div>
                  <p className="text-muted-foreground/60 mb-1">Última atualização</p>
                  <p className="font-medium">{agent.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-muted-foreground/60 mb-1">Versão</p>
                  <p className="font-medium">{agent.version}</p>
                </div>
                <div>
                  <p className="text-muted-foreground/60 mb-1">Bases de conhecimento</p>
                  <p className="font-medium">{agent.knowledgeBases}</p>
                </div>
                <div>
                  <p className="text-muted-foreground/60 mb-1">Dados de treinamento</p>
                  <p className="font-medium">{agent.trainingDataSize}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Ações</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Análises
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-subtle rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-lg font-semibold mb-4 text-red-300">Zona de Risco</h3>
              <Button variant="outline" className="w-full justify-start gap-2 hover:text-red-400 hover:border-red-500/50">
                <Trash2 className="w-4 h-4" />
                Deletar Agente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
