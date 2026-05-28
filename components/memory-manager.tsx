"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getAgentMemories, deleteAgentMemories } from "@/lib/agents"
import { Trash2, Brain, Heart, Sparkles, BookOpen, AlertTriangle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface MemoryItem {
  id: string
  title: string
  content: string
  type: string
  importance: number
  emotional_valence: number
  is_blocked: boolean
  created_at: string | null
}

const TYPE_META: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  autobiographical: { label: "Autobiografia", icon: BookOpen, color: "text-amber-400" },
  semantic: { label: "Conhecimento", icon: Brain, color: "text-blue-400" },
  emotional: { label: "Emocional", icon: Heart, color: "text-rose-400" },
  relational: { label: "Relacional", icon: Heart, color: "text-pink-400" },
  episodic: { label: "Episodio", icon: Sparkles, color: "text-purple-400" },
  short_term: { label: "Curto prazo", icon: Brain, color: "text-cyan-400" },
  long_term: { label: "Longo prazo", icon: Brain, color: "text-emerald-400" },
  traumatic: { label: "Traumatica", icon: AlertTriangle, color: "text-red-400" },
  aspirational: { label: "Aspiracional", icon: Sparkles, color: "text-yellow-400" },
  procedural: { label: "Procedural", icon: Brain, color: "text-indigo-400" },
}

interface MemoryManagerProps {
  agentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemoryManager({ agentId, open, onOpenChange }: MemoryManagerProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSelected(new Set())
    setSearch("")
    getAgentMemories(agentId)
      .then((data) => setMemories(data.memories || []))
      .catch(() => setMemories([]))
      .finally(() => setLoading(false))
  }, [open, agentId])

  const filtered = memories.filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
  })

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((m) => m.id)))
    }
  }

  const handleDelete = async () => {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    const isAll = ids.length === memories.length
    const msg = isAll
      ? `Apagar TODAS as ${memories.length} memorias? Esta acao nao pode ser revertida.`
      : `Apagar ${ids.length} memoria${ids.length > 1 ? "s" : ""} selecionada${ids.length > 1 ? "s" : ""}?`
    if (!confirm(msg)) return

    setDeleting(true)
    try {
      await deleteAgentMemories(agentId, isAll ? undefined : ids)
      setMemories((prev) => isAll ? [] : prev.filter((m) => !selected.has(m.id)))
      setSelected(new Set())
    } catch {}
    setDeleting(false)
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Memorias do agente
          </DialogTitle>
          <DialogDescription>
            Seleciona as memorias que queres apagar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar memorias..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {memories.length} total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {memories.length === 0 ? "Nenhuma memoria encontrada." : "Nenhum resultado para a pesquisa."}
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                onClick={toggleAll}
                className="text-[10px] text-primary hover:underline px-1 mb-1"
              >
                {selected.size === filtered.length ? "Desselecionar tudo" : "Selecionar tudo"}
              </button>
              {filtered.map((mem) => {
                const meta = TYPE_META[mem.type] || { label: mem.type, icon: Brain, color: "text-muted-foreground" }
                const Icon = meta.icon
                const isSelected = selected.has(mem.id)
                return (
                  <div
                    key={mem.id}
                    onClick={() => toggleSelect(mem.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/40 hover:border-border/80 bg-card/30"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(mem.id)}
                      className="mt-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3 h-3 ${meta.color} shrink-0`} />
                        <span className={`text-[10px] ${meta.color}`}>{meta.label}</span>
                        <div className="flex-1" />
                        <span className="text-[10px] text-muted-foreground">{formatDate(mem.created_at)}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">{mem.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{mem.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {mem.importance > 0.7 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                            importante
                          </span>
                        )}
                        {mem.is_blocked && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">
                            bloqueada
                          </span>
                        )}
                        {mem.emotional_valence < -0.3 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                            negativa
                          </span>
                        )}
                        {mem.emotional_valence > 0.3 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                            positiva
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {selected.size > 0 && (
            <span className="text-xs text-muted-foreground mr-auto">
              {selected.size} selecionada{selected.size > 1 ? "s" : ""}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={selected.size === 0 || deleting}
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "A apagar..." : `Apagar (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
