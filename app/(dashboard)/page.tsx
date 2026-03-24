"use client"

import { Button } from "@/components/ui/button"
import {
  Brain,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Users,
} from "lucide-react"
import Link from "next/link"

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative"
}

export default function DashboardPage() {
  const stats: StatCard[] = [
    {
      icon: <Brain className="w-5 h-5" />,
      label: "Agentes Ativos",
      value: "5",
      change: "+2 este mês",
      changeType: "positive",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Conversas Totais",
      value: "3.2K",
      change: "+24% vs mês anterior",
      changeType: "positive",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Performance Média",
      value: "90%",
      change: "+5% de melhora",
      changeType: "positive",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Tempo de Resposta",
      value: "1.2s",
      change: "-0.3s vs semana anterior",
      changeType: "positive",
    },
  ]

  const recentAgents = [
    {
      id: "1",
      name: "Analisador Lógico",
      emoji: "🧠",
      status: "active",
      conversations: 847,
    },
    {
      id: "2",
      name: "Conselheiro Emocional",
      emoji: "💙",
      status: "active",
      conversations: 523,
    },
    {
      id: "3",
      name: "Gerador Criativo",
      emoji: "✨",
      status: "active",
      conversations: 612,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bem-vindo de volta! 👋</h1>
          <p className="text-muted-foreground">
            Aqui tens uma visão geral do desempenho dos teus agentes de IA.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-subtle rounded-2xl p-6 border border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
                {stat.change && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.changeType === "positive"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground/80 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agents Overview */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Agentes Recentes</h2>
                <Link href="/agents">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Ver Todos
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentAgents.map((agent) => (
                  <Link key={agent.id} href={`/agents/${agent.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">{agent.emoji}</div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.conversations} conversas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                          Ativo
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/agents/create">
                  <Button className="h-12 w-full text-sm font-medium">
                    <Brain className="w-4 h-4 mr-2" />
                    Novo Agente
                  </Button>
                </Link>
                <Button variant="outline" className="h-12 text-sm font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
                <Button variant="outline" className="h-12 text-sm font-medium">
                  <Users className="w-4 h-4 mr-2" />
                  Equipa
                </Button>
                <Button variant="outline" className="h-12 text-sm font-medium">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Suporte
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Usage */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Uso Mensal</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Computações</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Armazenamento</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: "42%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-subtle rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Notificações</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300 font-medium">Nova atualização disponível</p>
                  <p className="text-xs text-blue-200/70 mt-1">Versão 2.1.0 está pronta para instalação</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-300 font-medium">Meta atingida!</p>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    Agente "Analisador Lógico" atingiu 90% performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
