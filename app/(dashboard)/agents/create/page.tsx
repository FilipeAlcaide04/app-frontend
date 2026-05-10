"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  X,
} from "lucide-react"
import {
  createAgent,
  THINKING_STYLES,
  DECISION_APPROACHES,
  DEFAULT_PERSONALITY,
  PERSONALITY_LABELS,
  MICRO_AGENT_TYPES,
} from "@/lib/agents"

const EMOJI_CHOICES = [
  "🤖", "🧠", "✨", "💙", "📚", "🚀", "🌟", "🪐", "🔮", "⚡",
  "🧩", "🎨", "💡", "🦾", "🧬", "🪶", "🔬", "🛰️", "🦉", "🌿",
]

const MICRO_AGENT_COLOURS: Record<string, string> = {
  logical: "from-blue-500/20 to-blue-600/10 text-blue-300 border-blue-500/30",
  emotional: "from-rose-500/20 to-rose-600/10 text-rose-300 border-rose-500/30",
  critical: "from-amber-500/20 to-amber-600/10 text-amber-300 border-amber-500/30",
  creative: "from-purple-500/20 to-purple-600/10 text-purple-300 border-purple-500/30",
  ethical: "from-emerald-500/20 to-emerald-600/10 text-emerald-300 border-emerald-500/30",
  social: "from-cyan-500/20 to-cyan-600/10 text-cyan-300 border-cyan-500/30",
}

const TOTAL_STEPS = 4

interface Memory {
  title: string
  content: string
  importance_score: number
  emotional_valence: number
}

export default function CreateAgentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [avatar, setAvatar] = useState("🤖")
  const [backgroundStory, setBackgroundStory] = useState("")
  const [thinkingStyle, setThinkingStyle] = useState("balanced")
  const [decisionApproach, setDecisionApproach] = useState("collaborative")
  const [debateIntensity, setDebateIntensity] = useState(0.7)
  const [personality, setPersonality] = useState<Record<string, number>>({ ...DEFAULT_PERSONALITY })
  const [microAgents, setMicroAgents] = useState<string[]>(
    MICRO_AGENT_TYPES.map((m) => m.value),
  )
  const [memories, setMemories] = useState<Memory[]>([])

  const canAdvance = () => {
    if (step === 1) return avatar.trim().length > 0 && name.trim().length >= 2
    if (step === 2) return thinkingStyle && decisionApproach
    return true
  }

  const toggleMicroAgent = (value: string) => {
    setMicroAgents((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  const addMemory = () => setMemories((prev) => [...prev, { title: "", content: "", importance_score: 0.7, emotional_valence: 0 }])
  const updateMemory = (idx: number, patch: Partial<Memory>) =>
    setMemories((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)))
  const removeMemory = (idx: number) => setMemories((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        avatar,
        background_story: backgroundStory.trim() || undefined,
        thinking_style: thinkingStyle,
        decision_making_approach: decisionApproach,
        debate_intensity: debateIntensity,
        personality_traits: personality,
        micro_agent_types: microAgents.length > 0 ? microAgents : undefined,
        initial_memories: memories
          .filter((m) => m.title.trim() && m.content.trim())
          .map((m) => ({
            title: m.title.trim(),
            content: m.content.trim(),
            importance_score: m.importance_score,
            emotional_valence: m.emotional_valence,
          })),
      }
      const created = await createAgent(payload)
      router.push(`/agents/${created.id}`)
    } catch (err: any) {
      setError(err?.message || "Falha ao criar agente")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/agents">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Criar novo agente</h1>
                <p className="text-sm text-muted-foreground">
                  Passo {step} de {TOTAL_STEPS}
                </p>
              </div>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-4 flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i < step
                    ? "bg-gradient-to-r from-primary to-accent"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 – Identity */}
        {step === 1 && (
          <div className="space-y-6">
            <SectionHeader
              title="Identidade"
              subtitle="Dá um rosto, um nome e uma breve descrição ao teu agente."
            />

            <Panel>
              <label className="block text-sm font-medium mb-3">Avatar</label>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center text-5xl shadow-lg">
                  {avatar}
                </div>
                <div className="text-sm text-muted-foreground">
                  Escolhe um emoji que represente o agente.
                  <br />
                  Podes também colar um emoji personalizado abaixo.
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1.5 mb-3">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setAvatar(e)}
                    className={`h-10 rounded-lg text-xl transition-all ${
                      avatar === e
                        ? "bg-primary/20 ring-2 ring-primary/40"
                        : "bg-card/40 hover:bg-card/60"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value.slice(0, 4))}
                className="max-w-[160px] text-center text-lg"
                maxLength={4}
              />
            </Panel>

            <Panel>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do agente *</label>
                  <Input
                    placeholder="Ex: Analisador Lógico"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição curta</label>
                  <textarea
                    placeholder="Um resumo de uma ou duas frases sobre o propósito do agente."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">{description.length}/500</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">História de fundo (opcional)</label>
                  <textarea
                    placeholder="Contexto, experiências marcantes, background do agente. Será usado para construir a identidade."
                    value={backgroundStory}
                    onChange={(e) => setBackgroundStory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    rows={5}
                    maxLength={2000}
                  />
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* STEP 2 – Cognition */}
        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader
              title="Cognição"
              subtitle="Define como o agente pensa, decide e como a sua personalidade se expressa."
            />

            <Panel title="Estilo de pensamento">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THINKING_STYLES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setThinkingStyle(opt.value)}
                    className={`text-left rounded-xl p-4 border-2 transition-all ${
                      thinkingStyle === opt.value
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/50 bg-card/30 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Abordagem de decisão">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DECISION_APPROACHES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecisionApproach(opt.value)}
                    className={`text-left rounded-xl p-4 border-2 transition-all ${
                      decisionApproach === opt.value
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/50 bg-card/30 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Intensidade de debate interno">
              <p className="text-xs text-muted-foreground mb-3">
                Quanto os micro-agentes discordam entre si antes de chegar a uma resposta.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={debateIntensity}
                  onChange={(e) => setDebateIntensity(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="font-mono text-sm w-12 text-right">{debateIntensity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-2 uppercase tracking-wider">
                <span>Harmonioso</span>
                <span>Debate intenso</span>
              </div>
            </Panel>

            <Panel title="Personalidade (Big Five)">
              <div className="space-y-4">
                {Object.entries(PERSONALITY_LABELS).map(([key, meta]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground/80">{meta.description}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {(personality[key] ?? 0.5).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={personality[key] ?? 0.5}
                      onChange={(e) =>
                        setPersonality((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* STEP 3 – Micro-agents */}
        {step === 3 && (
          <div className="space-y-6">
            <SectionHeader
              title="Micro-agentes"
              subtitle="Cada micro-agente representa uma voz interna que o agente usa para pensar e decidir."
            />

            <Panel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MICRO_AGENT_TYPES.map((m) => {
                  const active = microAgents.includes(m.value)
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => toggleMicroAgent(m.value)}
                      className={`text-left rounded-xl p-4 border-2 transition-all flex items-start gap-3 ${
                        active
                          ? `bg-gradient-to-br ${MICRO_AGENT_COLOURS[m.value]}`
                          : "border-border/50 bg-card/30 hover:border-primary/30 text-foreground"
                      }`}
                    >
                      <div className="text-3xl shrink-0">{m.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{m.label}</p>
                          {active && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">
                          {microAgentBlurb(m.value)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Selecciona pelo menos um. Podes refinar prompts individuais mais tarde.
              </p>
            </Panel>
          </div>
        )}

        {/* STEP 4 – Memories */}
        {step === 4 && (
          <div className="space-y-6">
            <SectionHeader
              title="Memórias iniciais"
              subtitle="Opcional. Semeia memórias autobiográficas que moldam a identidade do agente desde o início."
            />

            <Panel>
              {memories.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    O agente começa sem memórias. Podes adicionar algumas agora ou deixar para depois.
                  </p>
                  <Button variant="outline" size="sm" onClick={addMemory}>
                    Adicionar memória
                  </Button>
                </div>
              )}

              {memories.length > 0 && (
                <div className="space-y-4">
                  {memories.map((mem, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Input
                          placeholder="Título da memória"
                          value={mem.title}
                          onChange={(e) => updateMemory(idx, { title: e.target.value })}
                        />
                        <button
                          onClick={() => removeMemory(idx)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 shrink-0"
                          title="Remover"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        placeholder="Conteúdo da memória. Ex: 'Nasci numa cidade portuária no inverno de 1998...'"
                        value={mem.content}
                        onChange={(e) => updateMemory(idx, { content: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Importância</span>
                            <span className="font-mono">{mem.importance_score.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={mem.importance_score}
                            onChange={(e) =>
                              updateMemory(idx, { importance_score: Number(e.target.value) })
                            }
                            className="w-full accent-primary"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Valência emocional</span>
                            <span className="font-mono">{mem.emotional_valence.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.05}
                            value={mem.emotional_valence}
                            onChange={(e) =>
                              updateMemory(idx, { emotional_valence: Number(e.target.value) })
                            }
                            className="w-full accent-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addMemory}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Adicionar outra memória
                  </Button>
                </div>
              )}
            </Panel>

            <Panel title="Resumo">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <SummaryItem label="Nome" value={name || "—"} />
                <SummaryItem label="Avatar" value={avatar} />
                <SummaryItem label="Estilo" value={THINKING_STYLES.find((s) => s.value === thinkingStyle)?.label || thinkingStyle} />
                <SummaryItem label="Decisão" value={DECISION_APPROACHES.find((s) => s.value === decisionApproach)?.label || decisionApproach} />
                <SummaryItem label="Micro-agentes" value={`${microAgents.length} selecionado(s)`} />
                <SummaryItem label="Memórias" value={`${memories.filter((m) => m.title && m.content).length} válida(s)`} />
              </dl>
            </Panel>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-8 gap-3">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || submitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          {step < TOTAL_STEPS ? (
            <Button
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              disabled={!canAdvance() || submitting}
              className="gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || submitting}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  A criar agente...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Criar agente
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-1.5">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-7">
      {title && <h3 className="text-base font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 last:border-0 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right truncate max-w-[60%]">{value}</dd>
    </div>
  )
}

function microAgentBlurb(value: string): string {
  switch (value) {
    case "logical":
      return "Analisa estrutura, causa e efeito, consistência interna."
    case "emotional":
      return "Pondera o impacto emocional e a empatia na resposta."
    case "critical":
      return "Questiona premissas e procura falhas no raciocínio."
    case "creative":
      return "Gera alternativas, analogias e soluções originais."
    case "ethical":
      return "Avalia o que é justo, correcto ou prejudicial."
    case "social":
      return "Considera o contexto social e relacional."
    default:
      return ""
  }
}
