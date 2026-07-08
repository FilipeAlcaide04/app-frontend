"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  MessageSquareText,
  Sparkles,
  Database,
  FileText,
  Loader2,
  X,
  AlertCircle,
  Brain,
  Zap,
  Activity,
  RefreshCw,
  Copy,
  Check,
  Power,
} from "lucide-react"
import {
  Agent,
  getAgent,
  updateAgent,
  deleteAgent,
  getAgentMicroAgents,
  getAgentMemories,
  getAgentDocuments,
  agentArchetype,
  formatRelativeDate,
  PERSONALITY_LABELS,
  THINKING_STYLES,
  DECISION_APPROACHES,
} from "@/lib/agents"

type Tab = "overview" | "memory" | "micro" | "docs"

interface MicroAgentInfo {
  id: string
  type_name?: string
  type?: { name?: string; category?: string }
  custom_weight?: number | null
  activation_enabled?: boolean
  confidence_level?: number
  current_focus?: string | null
}

interface MemoryInfo {
  id: string
  title: string
  type?: string
  importance_score?: number
  emotional_valence?: number
}

interface DocInfo {
  id: string
  filename?: string
  description?: string
}

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const agentId = params.id

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [tab, setTab] = useState<Tab>("overview")

  const [microAgents, setMicroAgents] = useState<MicroAgentInfo[]>([])
  const [memories, setMemories] = useState<MemoryInfo[]>([])
  const [documents, setDocuments] = useState<DocInfo[]>([])

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchAgent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAgent(agentId)
      setAgent(data)
    } catch (err: any) {
      setError(err?.message || "Falha ao carregar agente")
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  useEffect(() => {
    if (!agent) return
    getAgentMicroAgents(agentId)
      .then((r) => setMicroAgents(r?.micro_agents || []))
      .catch(() => setMicroAgents([]))
    getAgentMemories(agentId)
      .then((r) => setMemories(r?.memories || []))
      .catch(() => setMemories([]))
    getAgentDocuments(agentId)
      .then((r) => setDocuments(r?.documents || []))
      .catch(() => setDocuments([]))
  }, [agent, agentId])

  const archetype = useMemo(() => (agent ? agentArchetype(agent) : null), [agent])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAgent(agentId)
      router.push("/agents")
    } catch (err: any) {
      setError(err?.message || "Falha ao apagar")
    } finally {
      setDeleting(false)
    }
  }

  const toggleActive = async () => {
    if (!agent) return
    try {
      const updated = await updateAgent(agentId, { is_active: !agent.is_active } as any)
      setAgent(updated)
    } catch (err: any) {
      setError(err?.message || "Falha ao atualizar")
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-xs text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400/60" />
          <h2 className="text-sm font-semibold mb-1">Agente não encontrado</h2>
          <p className="text-xs text-muted-foreground mb-4">{error || "Este agente não existe ou não tens acesso."}</p>
          <Link href="/agents">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="text-2xl shrink-0">{agent.avatar || "🤖"}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold truncate">{agent.name}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                agent.is_active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                {agent.is_active ? "Ativo" : "Inativo"}
              </span>
              {archetype && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
                  {archetype.emoji} {archetype.label}
                </span>
              )}
              {agent.is_shared && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20">
                  Partilhado
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Criado {formatRelativeDate(agent.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="sm" onClick={fetchAgent} disabled={loading} className="h-8 px-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleActive}
            className="h-8 px-2"
            title={agent.is_active ? "Desativar" : "Ativar"}
          >
            <Power className="w-3.5 h-3.5" />
          </Button>
          <Link href={`/agents/${agent.id}/edit`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => router.push(`/?agent=${agent.id}`)}>
            <MessageSquareText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Conversar</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-6 border-b border-border/40 -mx-1 px-1">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<Brain className="w-3.5 h-3.5" />}>Visão Geral</TabBtn>
        <TabBtn active={tab === "micro"} onClick={() => setTab("micro")} icon={<Sparkles className="w-3.5 h-3.5" />}>Micro-agentes <Badge>{microAgents.length}</Badge></TabBtn>
        <TabBtn active={tab === "memory"} onClick={() => setTab("memory")} icon={<Database className="w-3.5 h-3.5" />}>Memórias <Badge>{memories.length}</Badge></TabBtn>
        <TabBtn active={tab === "docs"} onClick={() => setTab("docs")} icon={<FileText className="w-3.5 h-3.5" />}>Documentos <Badge>{documents.length}</Badge></TabBtn>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      {tab === "overview" && <OverviewTab agent={agent} />}
      {tab === "micro" && <MicroAgentsTab items={microAgents} />}
      {tab === "memory" && <MemoriesTab items={memories} />}
      {tab === "docs" && <DocumentsTab items={documents} />}

      {/* Danger zone */}
      {tab === "overview" && (
        <div className="mt-8 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <h3 className="text-sm font-medium text-red-400 mb-1">Zona de risco</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Apagar o agente remove permanentemente todas as memórias, documentos e conversas.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-red-400 border-red-500/20 hover:bg-red-500/10 h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Apagar agente
          </Button>
        </div>
      )}

      {/* Edit is now a full page at /agents/[id]/edit */}
      {deleteOpen && (
        <ConfirmDeleteModal
          agent={agent}
          loading={deleting}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

function OverviewTab({ agent }: { agent: Agent }) {
  const traits = agent.personality_traits || {}
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card>
          <CardHeader title="Identidade" subtitle="Descrição e história de fundo." />
          {agent.description ? (
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">{agent.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic mb-3">Sem descrição.</p>
          )}
          {agent.background_story && (
            <div className="rounded-md bg-muted/30 border border-border/40 p-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
              {agent.background_story}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Cognição" subtitle="Estilo de pensamento e decisão." />
          <div className="grid sm:grid-cols-3 gap-3">
            <Fact label="Pensamento" value={THINKING_STYLES.find((s) => s.value === agent.thinking_style)?.label || agent.thinking_style} />
            <Fact label="Decisão" value={DECISION_APPROACHES.find((s) => s.value === agent.decision_making_approach)?.label || agent.decision_making_approach} />
            <Fact label="Debate" value={agent.debate_intensity.toFixed(2)} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Personalidade" subtitle="Big Five — 0 a 1." />
          <div className="space-y-2.5">
            {Object.entries(PERSONALITY_LABELS).map(([key, meta]) => {
              const v = traits[key as keyof typeof traits] ?? 0.5
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground/80">{meta.label}</span>
                    <span className="font-mono text-muted-foreground">{v.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground/25 rounded-full transition-all"
                      style={{ width: `${v * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Estatísticas" />
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={<Sparkles className="w-3.5 h-3.5" />} label="Micro-agentes" value={agent.micro_agents_count} />
            <StatBox icon={<Database className="w-3.5 h-3.5" />} label="Memórias" value={agent.memories_count} />
            <StatBox icon={<FileText className="w-3.5 h-3.5" />} label="Documentos" value={agent.documents_count} />
            <StatBox icon={<Activity className="w-3.5 h-3.5" />} label="Estado" value={agent.is_active ? "Ativo" : "Inativo"} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Metadados" />
          <dl className="space-y-2.5 text-sm">
            <MetaRow label="ID" value={<code className="text-[11px] font-mono text-muted-foreground">{agent.id.slice(0, 12)}…</code>} copy={agent.id} />
            <MetaRow label="Criado" value={formatRelativeDate(agent.created_at)} />
            <MetaRow label="Atualizado" value={formatRelativeDate(agent.updated_at)} />
            <MetaRow label="Última interação" value={formatRelativeDate(agent.last_interaction)} />
            {agent.owner_id && (
              <MetaRow label="Dono" value={<span className="font-mono text-[11px] text-muted-foreground">{agent.owner_id.slice(0, 8)}…</span>} />
            )}
          </dl>
        </Card>
      </div>
    </div>
  )
}

function MicroAgentsTab({ items }: { items: MicroAgentInfo[] }) {
  if (items.length === 0) {
    return <Empty icon={<Sparkles className="w-8 h-8" />} title="Sem micro-agentes" hint="Não existem micro-agentes configurados." />
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((m) => {
        const name = m.type_name || m.type?.name || "Micro-agente"
        return (
          <Card key={m.id}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium capitalize">{name}</h4>
                  {m.activation_enabled === false && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Off
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Peso: <span className="font-mono">{(m.custom_weight ?? 1).toFixed(2)}</span>
                  {" · "}
                  Confiança: <span className="font-mono">{((m.confidence_level ?? 0.5) * 100).toFixed(0)}%</span>
                </p>
                {m.current_focus && (
                  <p className="text-xs mt-1.5 text-muted-foreground italic">"{m.current_focus}"</p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function MemoriesTab({ items }: { items: MemoryInfo[] }) {
  if (items.length === 0) {
    return <Empty icon={<Database className="w-8 h-8" />} title="Sem memórias" hint="Memórias serão criadas à medida que o agente interage." />
  }
  return (
    <div className="space-y-2">
      {items.map((m) => (
        <Card key={m.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-sm font-medium truncate">{m.title}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                {m.type && (
                  <span className="px-1.5 py-0.5 rounded bg-muted">{m.type}</span>
                )}
                {typeof m.importance_score === "number" && (
                  <span>Importância: <span className="font-mono">{m.importance_score.toFixed(2)}</span></span>
                )}
                {typeof m.emotional_valence === "number" && (
                  <span>Valência: <span className="font-mono">{m.emotional_valence.toFixed(2)}</span></span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function DocumentsTab({ items }: { items: DocInfo[] }) {
  if (items.length === 0) {
    return <Empty icon={<FileText className="w-8 h-8" />} title="Sem documentos" hint="Ainda não carregaste documentos para este agente." />
  }
  return (
    <div className="space-y-2">
      {items.map((d) => (
        <Card key={d.id}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium truncate">{d.filename || "documento"}</h4>
              {d.description && <p className="text-[11px] text-muted-foreground truncate">{d.description}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ConfirmDeleteModal({
  agent,
  loading,
  onCancel,
  onConfirm,
}: {
  agent: Agent
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Apagar agente</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Esta ação é irreversível. Vais perder memórias, documentos e conversas de <span className="font-medium text-foreground">{agent.name}</span>.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button size="sm" onClick={onConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apagar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* Primitives */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-5">
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  )
}

function TabBtn({ children, active, onClick, icon }: { children: React.ReactNode; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded bg-muted text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/30 border border-border/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  )
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/30 border border-border/40 p-3">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function MetaRow({ label, value, copy }: { label: string; value: React.ReactNode; copy?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 min-w-0">
        <span className="truncate">{value}</span>
        {copy && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(copy)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="p-0.5 rounded hover:bg-muted shrink-0"
            title="Copiar"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </button>
        )}
      </dd>
    </div>
  )
}

function Empty({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 py-12 flex flex-col items-center justify-center text-center">
      <div className="text-muted-foreground/40 mb-3">{icon}</div>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{hint}</p>
    </div>
  )
}
