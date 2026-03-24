"use client"

import { useState } from "react"
import {
  Settings,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  LogOut,
  User,
  Zap,
  Brain,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Agent {
  id: string
  name: string
  role: string
  status: "active" | "inactive"
  processingSpeed: number
}

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "agents" | "account" | "settings">("dashboard")
  const [selectedAgent, setSelectedAgent] = useState<string>("agent-1")
  const [isExpanded, setIsExpanded] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([
    { id: "agent-1", name: "Agente Principal", role: "Análise Lógica", status: "active", processingSpeed: 95 },
    { id: "agent-2", name: "Análise Contextual", role: "Processamento Semântico", status: "active", processingSpeed: 87 },
    { id: "agent-3", name: "Criatividade", role: "Geração de Ideias", status: "inactive", processingSpeed: 0 },
  ])

  const dashboardTabs = [
    { id: "dashboard", label: "Dashboard", icon: Brain },
    { id: "agents", label: "Agentes", icon: Zap },
    { id: "account", label: "Conta", icon: User },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
  }

  return (
    <section className={`hidden lg:flex w-[25%] h-full flex-col relative min-h-0 border-l border-border bg-gradient-to-br from-card/20 via-background/20 to-background/20 backdrop-blur-sm overflow-y-auto transition-all duration-300 ${
      !isExpanded ? "w-20" : "w-[25%]"
    }`}>
      {/* Header com toggle */}
      <div className="sticky top-0 z-20 p-4 border-b border-border/30 bg-gradient-to-b from-card/40 to-transparent backdrop-blur-sm flex items-center justify-between">
        <div className={`${isExpanded ? "block" : "hidden"} flex items-center gap-2`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">Painel</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {isExpanded && (
        <>
          {/* Tab Navigation */}
          <div className="px-3 py-2 space-y-1 border-b border-border/20">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-4 animate-appear">
                {/* Quick Stats */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">Resumo do Sistema</h3>
                  <div className="grid gap-2">
                    <div className="p-3 rounded-lg bg-card/60 border border-border/50 hover:border-primary/30 transition-all">
                      <p className="text-xs text-muted-foreground mb-1">Agentes Ativos</p>
                      <p className="text-lg font-bold text-primary">{agents.filter(a => a.status === "active").length}/{agents.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/60 border border-border/50 hover:border-accent/30 transition-all">
                      <p className="text-xs text-muted-foreground mb-1">Tempo Resposta Médio</p>
                      <p className="text-lg font-bold text-accent">142ms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/60 border border-border/50 hover:border-primary/30 transition-all">
                      <p className="text-xs text-muted-foreground mb-1">Sessões Ativas</p>
                      <p className="text-lg font-bold text-primary">1</p>
                    </div>
                  </div>
                </div>

                {/* Current Agent Selection */}
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">Agente Atual</h3>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-sm text-foreground focus:border-primary/50 transition-all"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} {agent.status === "active" ? "✓" : "○"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">Ações Rápidas</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-between h-9 text-xs">
                      <span>Nova Conversa</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between h-9 text-xs">
                      <span>Histórico</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === "agents" && (
              <div className="space-y-4 animate-appear">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Gerenciar Agentes</h3>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedAgent === agent.id
                          ? "bg-primary/10 border-primary/50"
                          : "bg-card/40 border-border/50 hover:bg-card/60"
                      }`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{agent.name}</p>
                          <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-muted"}`} />
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Performance</span>
                          <span className="text-[10px] text-foreground font-mono">{agent.processingSpeed}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            style={{ width: `${agent.processingSpeed}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-1">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-1 text-destructive hover:text-destructive/80"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAgent(agent.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="space-y-4 animate-appear">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">Perfil</h3>

                <div className="p-3 rounded-lg bg-card/60 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Utilizador</p>
                      <p className="text-xs text-muted-foreground">user@exemplo.com</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/30 pt-3">
                    <Button variant="outline" className="w-full justify-between h-9 text-xs">
                      <span>Editar Perfil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between h-9 text-xs">
                      <span>Alterar Palavra-Passe</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between h-9 text-xs">
                      <span>Dados Pessoais</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <Button variant="outline" className="w-full justify-between h-9 text-xs text-destructive hover:text-destructive/80">
                    <span>Eliminar Conta</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-4 animate-appear">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">Configurações</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/50">
                    <div>
                      <p className="text-xs font-medium text-foreground">Modo Escuro</p>
                      <p className="text-[10px] text-muted-foreground">Sempre ativado</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/50">
                    <div>
                      <p className="text-xs font-medium text-foreground">Notificações</p>
                      <p className="text-[10px] text-muted-foreground">Ativas</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/50">
                    <div>
                      <p className="text-xs font-medium text-foreground">Partilha de Dados</p>
                      <p className="text-[10px] text-muted-foreground">Opcional</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <Button variant="outline" className="w-full justify-between h-9 text-xs flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminar Sessão</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
