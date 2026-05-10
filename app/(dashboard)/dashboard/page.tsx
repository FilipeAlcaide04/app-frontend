"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Database,
  FileText,
  MessageSquare,
  Sparkles,
  Zap,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Activity,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getDashboardStats } from "@/lib/auth"
import { formatRelativeDate } from "@/lib/agents"

interface DashboardData {
  totals: {
    agents: number
    active_agents: number
    memories: number
    documents: number
    micro_agents: number
    conversations: number
    messages: number
    learning_events: number
    synaptic_connections: number
  }
  agents: {
    id: string
    name: string
    avatar: string
    is_active: boolean
    thinking_style: string
    memories: number
    documents: number
    conversations: number
    messages: number
    last_interaction: string | null
    created_at: string | null
  }[]
  recent_conversations: {
    id: string
    agent_id: string
    agent_name: string
    agent_avatar: string
    message_count: number
    current_topic: string | null
    emotional_tone: string | null
    started_at: string | null
    is_active: boolean
  }[]
  user: {
    name: string
    created_at: string | null
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const stats = await getDashboardStats()
      setData(stats)
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400/60 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  const t = data.totals
  const sortedAgents = [...data.agents].sort((a, b) => b.messages - a.messages)
  const topAgent = sortedAgents[0]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Olá, {user?.name || "—"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchStats} className="h-8 px-2">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Agentes" value={t.agents} sub={`${t.active_agents} ativos`} icon={<Brain className="w-4 h-4" />} />
        <StatCard label="Memórias" value={t.memories} icon={<Database className="w-4 h-4" />} />
        <StatCard label="Mensagens" value={t.messages} sub={`${t.conversations} conversas`} icon={<MessageSquare className="w-4 h-4" />} />
        <StatCard label="Documentos" value={t.documents} icon={<FileText className="w-4 h-4" />} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-lg border border-border/60 bg-card p-4 flex items-center gap-3">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold leading-none">{t.micro_agents}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Micro-agentes</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 flex items-center gap-3">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold leading-none">{t.synaptic_connections}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sinapses</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold leading-none">{t.learning_events}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Aprendizagens</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agents */}
        <div className="rounded-lg border border-border/60 bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <h2 className="text-sm font-medium">Agentes por atividade</h2>
            <Link href="/agents" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {sortedAgents.length === 0 ? (
            <div className="text-center py-12 px-5">
              <p className="text-sm text-muted-foreground mb-3">Ainda sem agentes.</p>
              <Link href="/agents/create">
                <Button size="sm" className="gap-1.5 h-8">
                  <Sparkles className="w-3.5 h-3.5" />
                  Criar agente
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {sortedAgents.map((agent) => {
                const maxMsgs = topAgent?.messages || 1
                const pct = Math.max(3, Math.round((agent.messages / maxMsgs) * 100))
                return (
                  <Link key={agent.id} href={`/?agent=${agent.id}`} className="block">
                    <div className="px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{agent.avatar || "🤖"}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{agent.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {agent.messages} msg · {agent.conversations} conversas
                            </p>
                          </div>
                        </div>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground/20 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="rounded-lg border border-border/60 bg-card">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="text-sm font-medium">Conversas recentes</h2>
          </div>

          {data.recent_conversations.length === 0 ? (
            <div className="text-center py-12 px-5">
              <p className="text-sm text-muted-foreground">Ainda sem conversas.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {data.recent_conversations.map((conv) => (
                <Link key={conv.id} href={`/?agent=${conv.agent_id}`} className="block">
                  <div className="px-5 py-3 hover:bg-muted/30 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{conv.agent_avatar || "🤖"}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{conv.agent_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {conv.current_topic || `${conv.message_count} mensagens`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(conv.started_at)}
                      </p>
                      {conv.is_active && (
                        <span className="text-[10px] text-emerald-500 font-medium">ativa</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon }: { label: string; value: number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  )
}
