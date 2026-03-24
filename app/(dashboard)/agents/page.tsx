"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Brain,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Play,
  Copy,
  Share2,
  Clock,
  TrendingUp,
  Zap,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
  emoji: string
  status: "active" | "inactive" | "training"
  created: string
  lastActive: string
  conversations: number
  performance: number
  type: "logic" | "emotional" | "creative" | "memory"
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Analisador Lógico",
    description: "Especializado em análise crítica e resolução de problemas complexos",
    emoji: "🧠",
    status: "active",
    created: "2024-01-15",
    lastActive: "há 2 min",
    conversations: 847,
    performance: 94,
    type: "logic",
  },
  {
    id: "2",
    name: "Conselheiro Emocional",
    description: "Oferece suporte emocional e validação com empatia profunda",
    emoji: "💙",
    status: "active",
    created: "2024-02-03",
    lastActive: "há 1h",
    conversations: 523,
    performance: 89,
    type: "emotional",
  },
  {
    id: "3",
    name: "Gerador Criativo",
    description: "Cria conteúdo original, ideias inovadoras e soluções criativas",
    emoji: "✨",
    status: "active",
    created: "2024-02-20",
    lastActive: "há 5h",
    conversations: 612,
    performance: 87,
    type: "creative",
  },
  {
    id: "4",
    name: "Arquivista de Memória",
    description: "Gerencia e recupera informações, aprende do histórico",
    emoji: "📚",
    status: "active",
    created: "2024-03-01",
    lastActive: "há 30 min",
    conversations: 1203,
    performance: 92,
    type: "memory",
  },
  {
    id: "5",
    name: "Mentor de Progresso",
    description: "Guia desenvolvimento pessoal e acompanha evolução",
    emoji: "🚀",
    status: "training",
    created: "2024-03-10",
    lastActive: "há 3h",
    conversations: 234,
    performance: 78,
    type: "logic",
  },
]

const typeLabels = {
  logic: "Lógico",
  emotional: "Emocional",
  creative: "Criativo",
  memory: "Memória",
}

const typeColors = {
  logic: "from-blue-500/20 to-blue-600/10 text-blue-300",
  emotional: "from-rose-500/20 to-rose-600/10 text-rose-300",
  creative: "from-purple-500/20 to-purple-600/10 text-purple-300",
  memory: "from-amber-500/20 to-amber-600/10 text-amber-300",
}

function AgentCard({ agent }: { agent: Agent }) {
  const [showMenu, setShowMenu] = useState(false)

  const statusColors = {
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    inactive: "bg-muted/50 text-muted-foreground border-border",
    training: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  }

  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="group h-full glass-subtle rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{agent.emoji}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground leading-tight">{agent.name}</h3>
            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[agent.status]}`}>
              {agent.status === "active" ? "Ativo" : agent.status === "training" ? "Treinamento" : "Inativo"}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Menu */}
        {showMenu && (
          <div className="absolute mt-8 right-0 w-48 glass-strong rounded-xl border border-white/10 shadow-xl z-50">
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors">
              <Play className="w-4 h-4" />
              Executar
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5">
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5">
              <Copy className="w-4 h-4" />
              Duplicar
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-destructive/20 text-red-400 flex items-center gap-2 transition-colors border-t border-white/5">
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2">{agent.description}</p>

      {/* Type Badge */}
      <div className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${typeColors[agent.type]} border border-white/10`}>
        {typeLabels[agent.type]}
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4 pb-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs pt-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{agent.conversations} conversas</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{agent.performance}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Última atividade: {agent.lastActive}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-9" variant="outline">
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Executar
        </Button>
        <Button size="sm" className="h-9 px-3" variant="outline">
          <Share2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
    </Link>
  )
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "training">("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || agent.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/30 glass-subtle backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-6 sm:gap-0">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center -rotate-1">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Meus Agentes</h1>
                  <p className="text-sm text-muted-foreground">{filteredAgents.length} agentes criados</p>
                </div>
              </div>
              <Link href="/agents/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo Agente</span>
                </Button>
              </Link>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-4 sm:mt-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  placeholder="Procurar agentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Filters */}
                <div className="flex gap-2">
                  {(["all", "active", "training"] as const).map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={filter === f ? "default" : "outline"}
                      onClick={() => setFilter(f)}
                      className="text-xs"
                    >
                      {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Treinamento"}
                    </Button>
                  ))}
                </div>

                {/* View toggle */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setView(view === "grid" ? "list" : "grid")}
                  className="px-3"
                >
                  {view === "grid" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredAgents.length > 0 ? (
          <>
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAgents.map((agent) => (
                  <Link key={agent.id} href={`/agents/${agent.id}`}>
                    <div
                      className="glass-subtle rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer"
                    >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">{agent.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground/70">{agent.description}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
                      <span>{agent.conversations} conversas</span>
                      <span>{agent.performance}% eficiência</span>
                      <span>{agent.lastActive}</span>
                    </div>
                    <Button size="sm" className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum agente encontrado</h3>
            <p className="text-muted-foreground mb-6">Tenta criar o teu primeiro agente</p>
            <Link href="/agents/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Agente
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
