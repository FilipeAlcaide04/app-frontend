"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Brain,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  MessageSquareText,
  Sparkles,
  Database,
  FileText,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  AlertCircle,
  Users,
  Clock,
} from "lucide-react"
import {
  Agent,
  listAgents,
  deleteAgent,
  agentArchetype,
  formatRelativeDate,
} from "@/lib/agents"
import { useAuth } from "@/hooks/use-auth"

type View = "grid" | "list"
type Filter = "all" | "active" | "inactive"
type Sort = "recent" | "name" | "activity"

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
    />
  )
}

function AgentCardMenu({
  open,
  onClose,
  onEdit,
  onChat,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  onEdit: () => void
  onChat: () => void
  onDelete: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener("mousedown", h)
    return () => window.removeEventListener("mousedown", h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      ref={ref}
      className="absolute right-2 top-12 z-30 w-44 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onChat}
        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
      >
        <MessageSquareText className="w-3.5 h-3.5 text-muted-foreground" />
        Conversar
      </button>
      <button
        onClick={onEdit}
        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
        Editar
      </button>
      <div className="border-t border-border" />
      <button
        onClick={onDelete}
        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Apagar
      </button>
    </div>
  )
}

function AgentCard({
  agent,
  onDelete,
}: {
  agent: Agent
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const archetype = agentArchetype(agent)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      onClick={() => router.push(`/agents/${agent.id}`)}
      className="group relative rounded-lg border border-border/60 bg-card hover:border-border hover:bg-card/80 transition-colors cursor-pointer flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl shrink-0">{agent.avatar || "🤖"}</span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">
                {agent.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusDot active={agent.is_active} />
                <span className="text-xs text-muted-foreground">
                  {agent.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((s) => !s)
            }}
            className="p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <AgentCardMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onEdit={() => {
              setMenuOpen(false)
              router.push(`/agents/${agent.id}`)
            }}
            onChat={() => {
              setMenuOpen(false)
              router.push(`/?agent=${agent.id}`)
            }}
            onDelete={() => {
              setMenuOpen(false)
              onDelete(agent.id)
            }}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 min-h-[2rem]">
          {agent.description || "Sem descrição."}
        </p>

        {/* Archetype & Shared badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
            {archetype.emoji} {archetype.label}
          </span>
          {agent.is_shared && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20">
              <Users className="w-2.5 h-2.5" /> Partilhado
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-auto pt-3 border-t border-border/40 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title="Micro-agentes">
            <Sparkles className="w-3 h-3" /> {agent.micro_agents_count}
          </span>
          <span className="flex items-center gap-1" title="Memórias">
            <Database className="w-3 h-3" /> {agent.memories_count}
          </span>
          <span className="flex items-center gap-1" title="Documentos">
            <FileText className="w-3 h-3" /> {agent.documents_count}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeDate(agent.last_interaction || agent.updated_at)}
          </span>
        </div>
      </div>
    </div>
  )
}

function AgentRow({
  agent,
  onDelete,
}: {
  agent: Agent
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const archetype = agentArchetype(agent)
  return (
    <div
      onClick={() => router.push(`/agents/${agent.id}`)}
      className="group rounded-lg border border-border/60 bg-card hover:border-border hover:bg-card/80 p-4 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <span className="text-xl shrink-0">{agent.avatar || "🤖"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate">{agent.name}</h3>
            <StatusDot active={agent.is_active} />
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
              {archetype.emoji} {archetype.label}
            </span>
            {agent.is_shared && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20 flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> Partilhado
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {agent.description || "Sem descrição."}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-5 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1" title="Micro-agentes"><Sparkles className="w-3 h-3" />{agent.micro_agents_count}</span>
          <span className="flex items-center gap-1" title="Memórias"><Database className="w-3 h-3" />{agent.memories_count}</span>
          <span className="flex items-center gap-1" title="Documentos"><FileText className="w-3 h-3" />{agent.documents_count}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/?agent=${agent.id}`)
            }}
            title="Conversar"
          >
            <MessageSquareText className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(agent.id)
            }}
            title="Apagar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDelete({
  agent,
  onCancel,
  onConfirm,
  loading,
}: {
  agent: Agent
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
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
              Esta ação é irreversível. Memórias, documentos e conversas serão removidos.
            </p>
          </div>
        </div>
        <div className="rounded-md bg-muted/50 p-3 flex items-center gap-2.5 mb-5">
          <span className="text-lg">{agent.avatar || "🤖"}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{agent.name}</p>
            <p className="text-xs text-muted-foreground truncate">{agent.description || "—"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Apagar"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const { user, isAdmin } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [view, setView] = useState<View>("grid")
  const [sort, setSort] = useState<Sort>("recent")
  const [showAll, setShowAll] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Agent | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAgents({
        activeOnly: false,
        allUsers: isAdmin && showAll,
      })
      setAgents(data)
    } catch (err: any) {
      setError(err?.message || "Falha ao carregar agentes")
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, showAll])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = agents.filter((a) => {
      if (filter === "active" && !a.is_active) return false
      if (filter === "inactive" && a.is_active) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q) ||
        (a.thinking_style || "").toLowerCase().includes(q)
      )
    })
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "activity") {
        const at = new Date(a.last_interaction || a.updated_at || 0).getTime()
        const bt = new Date(b.last_interaction || b.updated_at || 0).getTime()
        return bt - at
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
    return list
  }, [agents, searchQuery, filter, sort])

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteAgent(pendingDelete.id)
      setAgents((prev) => prev.filter((a) => a.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err: any) {
      setError(err?.message || "Falha ao apagar agente")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Agentes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "A carregar..." : `${filtered.length} agente${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/agents/create">
          <Button size="sm" className="gap-1.5 h-8">
            <Plus className="w-3.5 h-3.5" />
            Novo agente
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Procurar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center rounded-md border border-border p-0.5">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none"
          >
            <option value="recent">Recentes</option>
            <option value="activity">Atividade</option>
            <option value="name">Nome</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className={`h-8 px-2.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
                showAll
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Users className="w-3 h-3" />
              {showAll ? "Todos" : "Meus"}
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center rounded-md border border-border p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`p-1 rounded transition-colors ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1 rounded transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAgents}
            disabled={loading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonGrid view={view} />
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={agents.length > 0} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={() => setPendingDelete(agent)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              onDelete={() => setPendingDelete(agent)}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDelete
          agent={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}

function SkeletonGrid({ view }: { view: View }) {
  if (view === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg border border-border/40 bg-muted/20 animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 rounded-lg border border-border/40 bg-muted/20 animate-pulse" />
      ))}
    </div>
  )
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
        <Brain className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium mb-1">
        {hasAny ? "Sem resultados" : "Ainda não tens agentes"}
      </h3>
      <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
        {hasAny
          ? "Ajusta a pesquisa ou os filtros."
          : "Cria o teu primeiro agente para começar."}
      </p>
      <Link href="/agents/create">
        <Button size="sm" className="gap-1.5 h-8">
          <Plus className="w-3.5 h-3.5" />
          Criar agente
        </Button>
      </Link>
    </div>
  )
}
