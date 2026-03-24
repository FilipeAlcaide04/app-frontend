"use client"

import { Button } from "@/components/ui/button"
import { LineChart, BarChart3, TrendingUp, Activity, Brain, Users } from "lucide-react"

export default function DashboardAnalyticsPage() {
  const chartData = [
    { month: "Jan", value: 240 },
    { month: "Fev", value: 340 },
    { month: "Mar", value: 200 },
    { month: "Abr", value: 500 },
    { month: "Mai", value: 780 },
    { month: "Jun", value: 690 },
  ]

  const maxValue = Math.max(...chartData.map((d) => d.value))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Análise detalhada do desempenho dos teus agentes</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                ↑ 12%
              </span>
            </div>
            <p className="text-sm text-muted-foreground/80 mb-1">Agentes Ativos</p>
            <p className="text-3xl font-bold">8</p>
          </div>

          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                ↑ 24%
              </span>
            </div>
            <p className="text-sm text-muted-foreground/80 mb-1">Requisições/dia</p>
            <p className="text-3xl font-bold">2.4K</p>
          </div>

          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                ↑ 8%
              </span>
            </div>
            <p className="text-sm text-muted-foreground/80 mb-1">Taxa de Sucesso</p>
            <p className="text-3xl font-bold">91.2%</p>
          </div>

          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                ↓ 2%
              </span>
            </div>
            <p className="text-sm text-muted-foreground/80 mb-1">Tempo Médio Resp.</p>
            <p className="text-3xl font-bold">1.1s</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Requisições Mensais</h2>
              <select className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm outline-none hover:bg-white/10 transition-colors">
                <option>Últimos 6 meses</option>
                <option>Últimos 12 meses</option>
              </select>
            </div>

            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">{data.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Agents */}
          <div className="glass-subtle rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-semibold mb-6">Agentes de Melhor Desempenho</h2>
            <div className="space-y-4">
              {[
                { name: "Analisador Lógico", emoji: "🧠", value: 94, bg: "bg-blue-500" },
                { name: "Arquivista de Memória", emoji: "📚", value: 92, bg: "bg-amber-500" },
                { name: "Conselheiro Emocional", emoji: "💙", value: 89, bg: "bg-rose-500" },
              ].map((agent, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.emoji}</span>
                      <p className="font-medium text-sm">{agent.name}</p>
                    </div>
                    <p className="font-semibold text-sm">{agent.value}%</p>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${agent.bg}`}
                      style={{ width: `${agent.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-subtle rounded-2xl p-6 border border-white/5 mt-6">
          <h2 className="text-lg font-semibold mb-6">Atividade Recente</h2>
          <div className="space-y-3">
            {[
              { time: "há 2h", action: "Novo agente criado", agent: "Gerador Criativo", status: "success" },
              {
                time: "há 4h",
                action: "Performance de agente atualizada",
                agent: "Analisador Lógico",
                status: "success",
              },
              {
                time: "há 1 dia",
                action: "Base de conhecimento adicionada",
                agent: "Conselheiro Emocional",
                status: "warning",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 transition-all"
              >
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground/70">{activity.agent}</p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
