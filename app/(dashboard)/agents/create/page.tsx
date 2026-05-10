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
  ChevronDown,
  Plus,
} from "lucide-react"
import {
  createPersona,
  THINKING_STYLES,
  DECISION_APPROACHES,
  DEFAULT_PERSONALITY,
  PERSONALITY_LABELS,
  MICRO_AGENT_TYPES,
} from "@/lib/agents"

// ─── Constants ───────────────────────────────────────────────────────────────

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

const ATTACHMENT_STYLES = [
  { value: "secure", label: "Seguro", desc: "Confortável com intimidade e independência" },
  { value: "anxious-preoccupied", label: "Ansioso", desc: "Procura proximidade constante, medo de abandono" },
  { value: "dismissive-avoidant", label: "Evitante", desc: "Valoriza independência, minimiza emoções" },
  { value: "fearful-avoidant", label: "Desorganizado", desc: "Deseja intimidade mas tem medo dela" },
]

const ERIKSON_STAGES = [
  { value: "trust_vs_mistrust", label: "Confiança vs Desconfiança" },
  { value: "autonomy_vs_shame", label: "Autonomia vs Vergonha" },
  { value: "initiative_vs_guilt", label: "Iniciativa vs Culpa" },
  { value: "industry_vs_inferiority", label: "Produtividade vs Inferioridade" },
  { value: "identity_vs_confusion", label: "Identidade vs Confusão" },
  { value: "intimacy_vs_isolation", label: "Intimidade vs Isolamento" },
  { value: "generativity_vs_stagnation", label: "Generatividade vs Estagnação" },
  { value: "integrity_vs_despair", label: "Integridade vs Desespero" },
]

const THERAPY_STATUSES = [
  { value: "never_considered", label: "Nunca considerou" },
  { value: "considered_but_resistant", label: "Considera mas resiste" },
  { value: "in_therapy", label: "Em terapia" },
  { value: "past_therapy", label: "Fez terapia no passado" },
  { value: "anti_therapy", label: "Contra terapia" },
]

const MEMORY_TYPES = [
  { value: "episodic", label: "Episódica" },
  { value: "semantic", label: "Semântica" },
  { value: "procedural", label: "Processual" },
]

const TRAUMA_TYPES = [
  { value: "abandonment", label: "Abandono" },
  { value: "betrayal", label: "Traição" },
  { value: "emotional_neglect", label: "Negligência emocional" },
  { value: "abuse", label: "Abuso" },
  { value: "loss", label: "Perda" },
  { value: "rejection", label: "Rejeição" },
  { value: "humiliation", label: "Humilhação" },
]

const PROCESSING_STATUSES = [
  { value: "unprocessed", label: "Não processado" },
  { value: "partially_processed", label: "Parcialmente processado" },
  { value: "intellectually_processed", label: "Intelectualmente processado" },
  { value: "emotionally_integrated", label: "Integrado emocionalmente" },
  { value: "actively_avoided", label: "Evitado activamente" },
]

const BIG_FIVE_FACETS: Record<string, { key: string; label: string }[]> = {
  openness: [
    { key: "fantasy", label: "Fantasia" },
    { key: "aesthetics", label: "Estética" },
    { key: "feelings", label: "Sentimentos" },
    { key: "actions", label: "Acções" },
    { key: "ideas", label: "Ideias" },
  ],
  conscientiousness: [
    { key: "competence", label: "Competência" },
    { key: "order", label: "Ordem" },
    { key: "dutifulness", label: "Dever" },
    { key: "self_discipline", label: "Autodisciplina" },
    { key: "deliberation", label: "Deliberação" },
  ],
  extraversion: [
    { key: "warmth", label: "Calidez" },
    { key: "gregariousness", label: "Gregarismo" },
    { key: "assertiveness", label: "Assertividade" },
    { key: "activity", label: "Actividade" },
    { key: "excitement_seeking", label: "Busca de excitação" },
  ],
  agreeableness: [
    { key: "trust", label: "Confiança" },
    { key: "straightforwardness", label: "Franqueza" },
    { key: "altruism", label: "Altruísmo" },
    { key: "compliance", label: "Complacência" },
    { key: "tendermindedness", label: "Sensibilidade" },
  ],
  neuroticism: [
    { key: "anxiety", label: "Ansiedade" },
    { key: "angry_hostility", label: "Hostilidade" },
    { key: "depression", label: "Depressão" },
    { key: "self_consciousness", label: "Autoconsciência" },
    { key: "vulnerability", label: "Vulnerabilidade" },
  ],
}

const TOTAL_STEPS = 7

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemoryEntry {
  content: string
  memoryType: string
  importance: number
  emotionalCharge: number
  hasTrauma: boolean
  trauma: {
    type: string
    severity: number
    processingStatus: string
    triggers: string[]
    beliefsFormed: string[]
  }
}

const emptyMemory = (): MemoryEntry => ({
  content: "",
  memoryType: "episodic",
  importance: 0.7,
  emotionalCharge: 0.5,
  hasTrauma: false,
  trauma: { type: "abandonment", severity: 0.5, processingStatus: "unprocessed", triggers: [], beliefsFormed: [] },
})

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CreateAgentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Identity
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [avatar, setAvatar] = useState("🤖")
  const [backgroundStory, setBackgroundStory] = useState("")
  const [selfConcept, setSelfConcept] = useState({ howTheySeeThemselves: "", howTheyWantToBeSeen: "", howTheyFearBeingSeen: "" })
  const [innerVoice, setInnerVoice] = useState({ tone: "", recurringPhrases: [] as string[] })
  const [languages, setLanguages] = useState<string[]>([])
  const [impostorSyndrome, setImpostorSyndrome] = useState(0.3)

  // Step 2: Personality
  const [attachmentStyle, setAttachmentStyle] = useState("secure")
  const [personality, setPersonality] = useState<Record<string, number>>({ ...DEFAULT_PERSONALITY })
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
  const [contradictions, setContradictions] = useState<string[]>([])
  const [masks, setMasks] = useState({ public: "", private: "" })
  const [shadow, setShadow] = useState("")
  const [humorStyle, setHumorStyle] = useState("")

  // Step 3: Values & Mind
  const [values, setValues] = useState<string[]>([])
  const [fears, setFears] = useState<string[]>([])
  const [motivations, setMotivations] = useState<string[]>([])
  const [defenseMechanisms, setDefenseMechanisms] = useState({ habitual: [] as string[], moderateStress: [] as string[], extremeStress: [] as string[] })
  const [biases, setBiases] = useState<string[]>([])
  const [limitingBeliefs, setLimitingBeliefs] = useState<string[]>([])
  const [innerNarrative, setInnerNarrative] = useState("")
  const [thinkingStyle, setThinkingStyle] = useState("balanced")
  const [decisionApproach, setDecisionApproach] = useState("collaborative")
  const [debateIntensity, setDebateIntensity] = useState(0.7)

  // Step 4: Emotions
  const [padBaseline, setPadBaseline] = useState({ pleasure: 0.5, arousal: 0.5, dominance: 0.5 })
  const [emotionalTriggers, setEmotionalTriggers] = useState<{ trigger: string; reaction: string }[]>([])
  const [windowOfTolerance, setWindowOfTolerance] = useState(0.5)
  const [energy, setEnergy] = useState({ baselineLevel: 0.6, recoveryRate: 0.05, drainRate: 0.08 })
  const [emotionalNeeds, setEmotionalNeeds] = useState({
    connection: { baseline: 0.5, importance: 0.7 },
    validation: { baseline: 0.5, importance: 0.7 },
    autonomy: { baseline: 0.5, importance: 0.7 },
    safety: { baseline: 0.5, importance: 0.7 },
  })
  const [stress, setStress] = useState({ baseline: 0.3, resilience: 0.6, breakingPoint: 0.9 })

  // Step 5: Behavior & Voice
  const [communicationStyle, setCommunicationStyle] = useState({ default: "", whenComfortable: "", whenThreatened: "" })
  const [apologyStyle, setApologyStyle] = useState("")
  const [stressResponses, setStressResponses] = useState({ low: "", medium: "", high: "" })
  const [selfSabotagePatterns, setSelfSabotagePatterns] = useState<string[]>([])
  const [voice, setVoice] = useState({ sentenceStructure: "", commonExpressions: [] as string[], idiolect: [] as string[] })
  const [rules, setRules] = useState<string[]>([])
  const [consistencyAnchors, setConsistencyAnchors] = useState({ neverChanges: [] as string[], signatureBehaviors: [] as string[], hardBoundaries: [] as string[] })

  // Step 6: Micro-agents & Memories
  const [microAgents, setMicroAgents] = useState<string[]>(MICRO_AGENT_TYPES.map((m) => m.value))
  const [memories, setMemories] = useState<MemoryEntry[]>([])

  // Step 7: Worldview & Growth
  const [worldview, setWorldview] = useState({ philosophicalOrientation: "", believesAbout: { humanNature: "", love: "", trust: "" } })
  const [growthArc, setGrowthArc] = useState({ currentEriksonStage: "", therapyStatus: "", regrets: [] as string[] })

  const canAdvance = () => {
    if (step === 1) return avatar.trim().length > 0 && name.trim().length >= 2
    return true
  }

  const toggleMicroAgent = (value: string) => {
    setMicroAgents((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const bigFive: Record<string, any> = {}
      for (const [trait, score] of Object.entries(personality)) {
        const entry: Record<string, any> = { score }
        if (facets[trait] && Object.keys(facets[trait]).length > 0) {
          entry.facets = facets[trait]
        }
        bigFive[trait] = entry
      }

      const persona: Record<string, any> = {
        identity: {
          ...(selfConcept.howTheySeeThemselves || selfConcept.howTheyWantToBeSeen || selfConcept.howTheyFearBeingSeen
            ? {
                self_concept: {
                  how_they_see_themselves: selfConcept.howTheySeeThemselves || undefined,
                  how_they_want_to_be_seen: selfConcept.howTheyWantToBeSeen || undefined,
                  how_they_fear_being_seen: selfConcept.howTheyFearBeingSeen || undefined,
                },
              }
            : {}),
          ...(innerVoice.tone
            ? {
                inner_voice: {
                  tone: innerVoice.tone,
                  recurring_phrases: innerVoice.recurringPhrases,
                },
              }
            : {}),
          ...(languages.length > 0 ? { languages } : {}),
          impostor_syndrome: impostorSyndrome,
        },
        internal_states_config: {
          energy: { baseline_level: energy.baselineLevel, recovery_rate: energy.recoveryRate, drain_rate: energy.drainRate },
          emotional_needs: {
            connection: { baseline: emotionalNeeds.connection.baseline, importance: emotionalNeeds.connection.importance },
            validation: { baseline: emotionalNeeds.validation.baseline, importance: emotionalNeeds.validation.importance },
            autonomy: { baseline: emotionalNeeds.autonomy.baseline, importance: emotionalNeeds.autonomy.importance },
            safety: { baseline: emotionalNeeds.safety.baseline, importance: emotionalNeeds.safety.importance },
          },
          stress: { baseline: stress.baseline, resilience: stress.resilience, breaking_point: stress.breakingPoint },
        },
        personality_full: {
          attachment_style: attachmentStyle,
          big_five: { natural: bigFive },
          ...(contradictions.length > 0 ? { contradictions } : {}),
          ...(masks.public || masks.private ? { masks: { public: masks.public || undefined, private: masks.private || undefined } } : {}),
          ...(shadow ? { shadow } : {}),
          ...(humorStyle ? { humor_style: humorStyle } : {}),
          ...(defenseMechanisms.habitual.length > 0 || defenseMechanisms.moderateStress.length > 0 || defenseMechanisms.extremeStress.length > 0
            ? {
                defense_mechanisms: {
                  habitual: defenseMechanisms.habitual,
                  moderate_stress: defenseMechanisms.moderateStress,
                  extreme_stress: defenseMechanisms.extremeStress,
                },
              }
            : {}),
          ...(values.length > 0 ? { values } : {}),
          ...(fears.length > 0 ? { fears } : {}),
          ...(motivations.length > 0 ? { motivations } : {}),
        },
        emotional_config: {
          baseline_emotions: { pad: { pleasure: padBaseline.pleasure, arousal: padBaseline.arousal, dominance: padBaseline.dominance } },
          ...(emotionalTriggers.length > 0
            ? { emotional_triggers: emotionalTriggers.filter((t) => t.trigger && t.reaction) }
            : {}),
          emotional_regulation: { window_of_tolerance: { default_width: windowOfTolerance } },
        },
        cognitive_config: {
          ...(biases.length > 0 ? { biases } : {}),
          ...(limitingBeliefs.length > 0 ? { limiting_beliefs: limitingBeliefs } : {}),
          ...(innerNarrative ? { inner_narrative: innerNarrative } : {}),
        },
        social_config: {
          ...(communicationStyle.default || communicationStyle.whenComfortable || communicationStyle.whenThreatened
            ? {
                communication_style: {
                  default: communicationStyle.default || undefined,
                  when_comfortable: communicationStyle.whenComfortable || undefined,
                  when_threatened: communicationStyle.whenThreatened || undefined,
                },
              }
            : {}),
          ...(apologyStyle ? { apology_style: apologyStyle } : {}),
        },
        behavioral_config: {
          ...(stressResponses.low || stressResponses.medium || stressResponses.high
            ? {
                stress_responses: {
                  low: stressResponses.low || undefined,
                  medium: stressResponses.medium || undefined,
                  high: stressResponses.high || undefined,
                },
              }
            : {}),
          ...(selfSabotagePatterns.length > 0 ? { self_sabotage_patterns: selfSabotagePatterns } : {}),
        },
        behavior_prompts: {
          ...(voice.sentenceStructure || voice.commonExpressions.length > 0 || voice.idiolect.length > 0
            ? {
                voice: {
                  sentence_structure: voice.sentenceStructure || undefined,
                  common_expressions: voice.commonExpressions,
                  idiolect: voice.idiolect,
                },
              }
            : {}),
          ...(rules.length > 0 ? { rules } : {}),
          ...(consistencyAnchors.neverChanges.length > 0 || consistencyAnchors.signatureBehaviors.length > 0 || consistencyAnchors.hardBoundaries.length > 0
            ? {
                consistency_anchors: {
                  never_changes: consistencyAnchors.neverChanges,
                  signature_behaviors: consistencyAnchors.signatureBehaviors,
                  hard_boundaries: consistencyAnchors.hardBoundaries,
                },
              }
            : {}),
        },
        ...(worldview.philosophicalOrientation || worldview.believesAbout.humanNature
          ? {
              worldview: {
                ...(worldview.philosophicalOrientation ? { philosophical_orientation: worldview.philosophicalOrientation } : {}),
                ...(worldview.believesAbout.humanNature || worldview.believesAbout.love || worldview.believesAbout.trust
                  ? {
                      believes_about: {
                        human_nature: worldview.believesAbout.humanNature || undefined,
                        love: worldview.believesAbout.love || undefined,
                        trust: worldview.believesAbout.trust || undefined,
                      },
                    }
                  : {}),
              },
            }
          : {}),
        ...(growthArc.currentEriksonStage || growthArc.therapyStatus || growthArc.regrets.length > 0
          ? {
              growth_arc: {
                ...(growthArc.currentEriksonStage ? { current_erikson_stage: growthArc.currentEriksonStage } : {}),
                ...(growthArc.therapyStatus ? { therapy_status: growthArc.therapyStatus } : {}),
                ...(growthArc.regrets.length > 0 ? { regrets: growthArc.regrets } : {}),
              },
            }
          : {}),
        memory_config: {
          initial_memories: memories
            .filter((m) => m.content.trim())
            .map((m) => ({
              content: m.content.trim(),
              memory_type: m.memoryType,
              importance: m.importance,
              emotional_charge: m.emotionalCharge,
              ...(m.hasTrauma
                ? {
                    trauma: {
                      type: m.trauma.type,
                      severity: m.trauma.severity,
                      processing_status: m.trauma.processingStatus,
                      triggers: m.trauma.triggers,
                      beliefs_formed: m.trauma.beliefsFormed,
                    },
                  }
                : {}),
            })),
        },
      }

      const result = await createPersona({
        name: name.trim(),
        description: description.trim() || undefined,
        avatar,
        background_story: backgroundStory.trim() || undefined,
        persona,
        personality_traits: personality,
        thinking_style: thinkingStyle,
        decision_making_approach: decisionApproach,
        debate_intensity: debateIntensity,
        micro_agent_types: microAgents.length > 0 ? microAgents : undefined,
        initial_memories: memories
          .filter((m) => m.content.trim())
          .map((m) => ({
            title: m.content.trim().slice(0, 80),
            content: m.content.trim(),
            type: m.memoryType,
            importance_score: m.importance,
            emotional_valence: m.emotionalCharge,
          })),
      })

      router.push(`/agents/${result.human.id}`)
    } catch (err: any) {
      setError(err?.message || "Falha ao criar agente")
    } finally {
      setSubmitting(false)
    }
  }

  const stepLabels = ["Identidade", "Personalidade", "Mente & Valores", "Emoções", "Comportamento", "Agentes & Memórias", "Visão & Resumo"]

  return (
    <div className="min-h-screen">
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
                <h1 className="text-xl sm:text-2xl font-bold truncate">Criar humano virtual</h1>
                <p className="text-sm text-muted-foreground">
                  {stepLabels[step - 1]} — Passo {step} de {TOTAL_STEPS}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => i < step && setStep(i + 1)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i < step ? "bg-primary" : "bg-white/10"
                } ${i < step ? "cursor-pointer hover:bg-primary/80" : "cursor-default"}`}
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

        {/* ── STEP 1: Identity ── */}
        {step === 1 && (
          <div className="space-y-6">
            <SectionHeader title="Identidade" subtitle="Quem é esta pessoa? Começa pelo básico." />

            <Panel>
              <label className="block text-sm font-medium mb-3">Avatar</label>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-5xl">
                  {avatar}
                </div>
                <p className="text-sm text-muted-foreground">Escolhe um emoji ou cola um personalizado.</p>
              </div>
              <div className="grid grid-cols-10 gap-1.5 mb-3">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setAvatar(e)}
                    className={`h-10 rounded-lg text-xl transition-all ${
                      avatar === e ? "bg-primary/20 ring-2 ring-primary/40" : "bg-card/40 hover:bg-card/60"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Input value={avatar} onChange={(e) => setAvatar(e.target.value.slice(0, 4))} className="max-w-[160px] text-center text-lg" maxLength={4} />
            </Panel>

            <Panel>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome *</label>
                  <Input placeholder="Ex: Sofia" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição curta</label>
                  <textarea
                    placeholder="Uma ou duas frases sobre esta pessoa."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    rows={3}
                    maxLength={500}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">História de fundo</label>
                  <textarea
                    placeholder="Contexto, experiências marcantes, background. Será usado para construir a identidade."
                    value={backgroundStory}
                    onChange={(e) => setBackgroundStory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    rows={5}
                    maxLength={2000}
                  />
                </div>
              </div>
            </Panel>

            <Collapsible title="Auto-conceito" subtitle="Como se vê, como quer ser vista, o que teme">
              <div className="space-y-4">
                <TextArea label="Como se vê a si própria" placeholder="Ex: Uma mulher forte que esconde fragilidades" value={selfConcept.howTheySeeThemselves} onChange={(v) => setSelfConcept((p) => ({ ...p, howTheySeeThemselves: v }))} />
                <TextArea label="Como quer ser vista" placeholder="Ex: Independente e confiante" value={selfConcept.howTheyWantToBeSeen} onChange={(v) => setSelfConcept((p) => ({ ...p, howTheyWantToBeSeen: v }))} />
                <TextArea label="Como teme ser vista" placeholder="Ex: Vulnerável ou dependente" value={selfConcept.howTheyFearBeingSeen} onChange={(v) => setSelfConcept((p) => ({ ...p, howTheyFearBeingSeen: v }))} />
              </div>
            </Collapsible>

            <Collapsible title="Voz interior" subtitle="O tom interno e frases recorrentes">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tom da voz interior</label>
                  <Input placeholder="Ex: Crítica mas esperançosa" value={innerVoice.tone} onChange={(e) => setInnerVoice((p) => ({ ...p, tone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frases recorrentes</label>
                  <TagInput tags={innerVoice.recurringPhrases} onChange={(v) => setInnerVoice((p) => ({ ...p, recurringPhrases: v }))} placeholder="Ex: Não precisas de ninguém" />
                </div>
              </div>
            </Collapsible>

            <Panel>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Idiomas</label>
                  <TagInput tags={languages} onChange={setLanguages} placeholder="Ex: Português" />
                </div>
                <SliderField label="Síndrome do impostor" value={impostorSyndrome} onChange={setImpostorSyndrome} min={0} max={1} step={0.05} leftLabel="Inexistente" rightLabel="Forte" />
              </div>
            </Panel>
          </div>
        )}

        {/* ── STEP 2: Personality ── */}
        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader title="Personalidade" subtitle="Traços de personalidade, estilo de vinculação e contradições internas." />

            <Panel title="Estilo de vinculação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ATTACHMENT_STYLES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAttachmentStyle(opt.value)}
                    className={`text-left rounded-xl p-4 border-2 transition-all ${
                      attachmentStyle === opt.value ? "border-primary/60 bg-primary/10" : "border-border/50 bg-card/30 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Personalidade (Big Five)">
              <div className="space-y-5">
                {Object.entries(PERSONALITY_LABELS).map(([key, meta]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground/80">{meta.description}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{(personality[key] ?? 0.5).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={personality[key] ?? 0.5}
                      onChange={(e) => setPersonality((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                    {BIG_FIVE_FACETS[key] && (
                      <Collapsible title={`Facetas de ${meta.label}`} compact>
                        <div className="space-y-3">
                          {BIG_FIVE_FACETS[key].map((f) => (
                            <SliderField
                              key={f.key}
                              label={f.label}
                              value={facets[key]?.[f.key] ?? personality[key] ?? 0.5}
                              onChange={(v) => setFacets((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [f.key]: v } }))}
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          ))}
                        </div>
                      </Collapsible>
                    )}
                  </div>
                ))}
              </div>
            </Panel>

            <Collapsible title="Contradições internas" subtitle="Tensões e paradoxos que definem esta pessoa">
              <TagInput tags={contradictions} onChange={setContradictions} placeholder="Ex: Quer intimidade mas afasta quem se aproxima" />
            </Collapsible>

            <Collapsible title="Máscaras & Sombra" subtitle="O que mostra ao mundo vs o que esconde">
              <div className="space-y-4">
                <TextArea label="Máscara pública" placeholder="Ex: Confiante, sarcástica, desligada" value={masks.public} onChange={(v) => setMasks((p) => ({ ...p, public: v }))} />
                <TextArea label="Eu privado" placeholder="Ex: Ansiosa, carente, insegura" value={masks.private} onChange={(v) => setMasks((p) => ({ ...p, private: v }))} />
                <TextArea label="Sombra" placeholder="Ex: Medo profundo de abandono que nega ter" value={shadow} onChange={setShadow} />
                <div>
                  <label className="block text-sm font-medium mb-2">Estilo de humor</label>
                  <Input placeholder="Ex: Sarcástico e autodepreciativo" value={humorStyle} onChange={(e) => setHumorStyle(e.target.value)} />
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        {/* ── STEP 3: Mind & Values ── */}
        {step === 3 && (
          <div className="space-y-6">
            <SectionHeader title="Mente & Valores" subtitle="Estilo cognitivo, valores, medos e mecanismos de defesa." />

            <Panel title="Estilo de pensamento">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THINKING_STYLES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setThinkingStyle(opt.value)}
                    className={`text-left rounded-xl p-4 border-2 transition-all ${
                      thinkingStyle === opt.value ? "border-primary/60 bg-primary/10" : "border-border/50 bg-card/30 hover:border-primary/30"
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
                      decisionApproach === opt.value ? "border-primary/60 bg-primary/10" : "border-border/50 bg-card/30 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Intensidade de debate interno">
              <SliderField label="" value={debateIntensity} onChange={setDebateIntensity} min={0} max={1} step={0.05} leftLabel="Harmonioso" rightLabel="Debate intenso" />
            </Panel>

            <Panel title="Valores, Medos & Motivações">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Valores fundamentais</label>
                  <TagInput tags={values} onChange={setValues} placeholder="Ex: Liberdade" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Medos</label>
                  <TagInput tags={fears} onChange={setFears} placeholder="Ex: Abandono" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Motivações</label>
                  <TagInput tags={motivations} onChange={setMotivations} placeholder="Ex: Provar que consegue sozinha" />
                </div>
              </div>
            </Panel>

            <Collapsible title="Mecanismos de defesa" subtitle="Como se protege em diferentes níveis de stress">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Habituais</label>
                  <TagInput tags={defenseMechanisms.habitual} onChange={(v) => setDefenseMechanisms((p) => ({ ...p, habitual: v }))} placeholder="Ex: Intelectualização" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stress moderado</label>
                  <TagInput tags={defenseMechanisms.moderateStress} onChange={(v) => setDefenseMechanisms((p) => ({ ...p, moderateStress: v }))} placeholder="Ex: Projecção" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stress extremo</label>
                  <TagInput tags={defenseMechanisms.extremeStress} onChange={(v) => setDefenseMechanisms((p) => ({ ...p, extremeStress: v }))} placeholder="Ex: Dissociação" />
                </div>
              </div>
            </Collapsible>

            <Collapsible title="Cognição" subtitle="Vieses, crenças limitantes e narrativa interna">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vieses cognitivos</label>
                  <TagInput tags={biases} onChange={setBiases} placeholder="Ex: Catastrofizar" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Crenças limitantes</label>
                  <TagInput tags={limitingBeliefs} onChange={setLimitingBeliefs} placeholder="Ex: Não mereço ser amada" />
                </div>
                <TextArea label="Narrativa interna" placeholder="Ex: Sobrevivente que ainda não percebeu que já não precisa de sobreviver" value={innerNarrative} onChange={setInnerNarrative} />
              </div>
            </Collapsible>
          </div>
        )}

        {/* ── STEP 4: Emotions ── */}
        {step === 4 && (
          <div className="space-y-6">
            <SectionHeader title="Emoções & Estados Internos" subtitle="Configuração emocional base, necessidades e respostas ao stress." />

            <Panel title="Baseline emocional (PAD)">
              <p className="text-xs text-muted-foreground mb-4">Pleasure-Arousal-Dominance: o estado emocional natural em repouso.</p>
              <div className="space-y-4">
                <SliderField label="Prazer" value={padBaseline.pleasure} onChange={(v) => setPadBaseline((p) => ({ ...p, pleasure: v }))} min={-1} max={1} step={0.05} leftLabel="Desprazer" rightLabel="Prazer" />
                <SliderField label="Activação" value={padBaseline.arousal} onChange={(v) => setPadBaseline((p) => ({ ...p, arousal: v }))} min={0} max={1} step={0.05} leftLabel="Calmo" rightLabel="Activado" />
                <SliderField label="Dominância" value={padBaseline.dominance} onChange={(v) => setPadBaseline((p) => ({ ...p, dominance: v }))} min={0} max={1} step={0.05} leftLabel="Submisso" rightLabel="Dominante" />
              </div>
            </Panel>

            <Panel title="Triggers emocionais">
              <p className="text-xs text-muted-foreground mb-4">Situações que provocam reacções emocionais específicas.</p>
              {emotionalTriggers.map((t, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <Input placeholder="Trigger" value={t.trigger} onChange={(e) => { const next = [...emotionalTriggers]; next[i] = { ...next[i], trigger: e.target.value }; setEmotionalTriggers(next) }} className="flex-1" />
                  <Input placeholder="Reacção" value={t.reaction} onChange={(e) => { const next = [...emotionalTriggers]; next[i] = { ...next[i], reaction: e.target.value }; setEmotionalTriggers(next) }} className="flex-1" />
                  <button onClick={() => setEmotionalTriggers((p) => p.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setEmotionalTriggers((p) => [...p, { trigger: "", reaction: "" }])}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar trigger
              </Button>
            </Panel>

            <Panel title="Janela de tolerância">
              <SliderField label="" value={windowOfTolerance} onChange={setWindowOfTolerance} min={0.1} max={1} step={0.05} leftLabel="Estreita" rightLabel="Ampla" />
            </Panel>

            <Collapsible title="Energia" subtitle="Níveis base, taxa de recuperação e de desgaste">
              <div className="space-y-4">
                <SliderField label="Nível base" value={energy.baselineLevel} onChange={(v) => setEnergy((p) => ({ ...p, baselineLevel: v }))} min={0} max={1} step={0.05} />
                <SliderField label="Taxa de recuperação" value={energy.recoveryRate} onChange={(v) => setEnergy((p) => ({ ...p, recoveryRate: v }))} min={0.01} max={0.2} step={0.01} />
                <SliderField label="Taxa de desgaste" value={energy.drainRate} onChange={(v) => setEnergy((p) => ({ ...p, drainRate: v }))} min={0.01} max={0.2} step={0.01} />
              </div>
            </Collapsible>

            <Collapsible title="Necessidades emocionais" subtitle="Nível base e importância de cada necessidade">
              <div className="space-y-6">
                {(["connection", "validation", "autonomy", "safety"] as const).map((need) => {
                  const labels: Record<string, string> = { connection: "Conexão", validation: "Validação", autonomy: "Autonomia", safety: "Segurança" }
                  return (
                    <div key={need} className="space-y-2">
                      <p className="text-sm font-medium">{labels[need]}</p>
                      <SliderField label="Nível base" value={emotionalNeeds[need].baseline} onChange={(v) => setEmotionalNeeds((p) => ({ ...p, [need]: { ...p[need], baseline: v } }))} min={0} max={1} step={0.05} />
                      <SliderField label="Importância" value={emotionalNeeds[need].importance} onChange={(v) => setEmotionalNeeds((p) => ({ ...p, [need]: { ...p[need], importance: v } }))} min={0} max={1} step={0.05} />
                    </div>
                  )
                })}
              </div>
            </Collapsible>

            <Collapsible title="Stress" subtitle="Nível base, resiliência e ponto de ruptura">
              <div className="space-y-4">
                <SliderField label="Nível base de stress" value={stress.baseline} onChange={(v) => setStress((p) => ({ ...p, baseline: v }))} min={0} max={1} step={0.05} leftLabel="Calmo" rightLabel="Stressado" />
                <SliderField label="Resiliência" value={stress.resilience} onChange={(v) => setStress((p) => ({ ...p, resilience: v }))} min={0} max={1} step={0.05} leftLabel="Frágil" rightLabel="Resiliente" />
                <SliderField label="Ponto de ruptura" value={stress.breakingPoint} onChange={(v) => setStress((p) => ({ ...p, breakingPoint: v }))} min={0.5} max={1} step={0.05} />
              </div>
            </Collapsible>
          </div>
        )}

        {/* ── STEP 5: Behavior & Voice ── */}
        {step === 5 && (
          <div className="space-y-6">
            <SectionHeader title="Comportamento & Voz" subtitle="Como comunica, reage e se expressa em diferentes contextos." />

            <Panel title="Estilo de comunicação">
              <div className="space-y-4">
                <TextArea label="Por defeito" placeholder="Ex: Directa, com sarcasmo como escudo" value={communicationStyle.default} onChange={(v) => setCommunicationStyle((p) => ({ ...p, default: v }))} />
                <TextArea label="Quando confortável" placeholder="Ex: Vulnerável, poética, profunda" value={communicationStyle.whenComfortable} onChange={(v) => setCommunicationStyle((p) => ({ ...p, whenComfortable: v }))} />
                <TextArea label="Quando ameaçada" placeholder="Ex: Cortante, fria, distante" value={communicationStyle.whenThreatened} onChange={(v) => setCommunicationStyle((p) => ({ ...p, whenThreatened: v }))} />
              </div>
            </Panel>

            <Panel>
              <TextArea label="Estilo de pedido de desculpa" placeholder="Ex: Raramente pede desculpa directamente, mostra arrependimento com acções" value={apologyStyle} onChange={setApologyStyle} />
            </Panel>

            <Panel title="Respostas ao stress">
              <div className="space-y-4">
                <TextArea label="Stress baixo" placeholder="Ex: Sarcasmo aumenta" value={stressResponses.low} onChange={(v) => setStressResponses((p) => ({ ...p, low: v }))} />
                <TextArea label="Stress médio" placeholder="Ex: Isola-se, responde com monossílabos" value={stressResponses.medium} onChange={(v) => setStressResponses((p) => ({ ...p, medium: v }))} />
                <TextArea label="Stress alto" placeholder="Ex: Explode ou desliga completamente" value={stressResponses.high} onChange={(v) => setStressResponses((p) => ({ ...p, high: v }))} />
              </div>
            </Panel>

            <Panel>
              <label className="block text-sm font-medium mb-2">Padrões de auto-sabotagem</label>
              <TagInput tags={selfSabotagePatterns} onChange={setSelfSabotagePatterns} placeholder="Ex: Afasta pessoas quando começam a ficar próximas" />
            </Panel>

            <Collapsible title="Voz" subtitle="Estrutura de frases, expressões e maneirismos">
              <div className="space-y-4">
                <TextArea label="Estrutura de frases" placeholder="Ex: Frases curtas e cortantes quando defensiva, longas e poéticas quando relaxada" value={voice.sentenceStructure} onChange={(v) => setVoice((p) => ({ ...p, sentenceStructure: v }))} />
                <div>
                  <label className="block text-sm font-medium mb-2">Expressões comuns</label>
                  <TagInput tags={voice.commonExpressions} onChange={(v) => setVoice((p) => ({ ...p, commonExpressions: v }))} placeholder="Ex: Ya..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Idiolecto</label>
                  <TagInput tags={voice.idiolect} onChange={(v) => setVoice((p) => ({ ...p, idiolect: v }))} placeholder="Ex: Usa reticências quando hesita" />
                </div>
              </div>
            </Collapsible>

            <Collapsible title="Regras comportamentais" subtitle="Regras que nunca quebra">
              <TagInput tags={rules} onChange={setRules} placeholder="Ex: Nunca diz eu amo-te primeiro" />
            </Collapsible>

            <Collapsible title="Âncoras de consistência" subtitle="Comportamentos fixos que mantêm a coerência da persona">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nunca muda</label>
                  <TagInput tags={consistencyAnchors.neverChanges} onChange={(v) => setConsistencyAnchors((p) => ({ ...p, neverChanges: v }))} placeholder="Ex: Sarcasmo como defesa" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comportamentos assinatura</label>
                  <TagInput tags={consistencyAnchors.signatureBehaviors} onChange={(v) => setConsistencyAnchors((p) => ({ ...p, signatureBehaviors: v }))} placeholder="Ex: Morder o lábio quando nervosa" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Limites inegociáveis</label>
                  <TagInput tags={consistencyAnchors.hardBoundaries} onChange={(v) => setConsistencyAnchors((p) => ({ ...p, hardBoundaries: v }))} placeholder="Ex: Nunca fala do pai voluntariamente" />
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        {/* ── STEP 6: Micro-agents & Memories ── */}
        {step === 6 && (
          <div className="space-y-6">
            <SectionHeader title="Micro-agentes & Memórias" subtitle="Vozes internas e memórias fundadoras que moldam a identidade." />

            <Panel title="Micro-agentes">
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
                        <p className="text-xs opacity-80 mt-0.5">{microAgentBlurb(m.value)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Panel>

            <Panel title="Memórias fundadoras">
              {memories.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Memórias autobiográficas que formam a identidade. Podem incluir traumas.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setMemories([emptyMemory()])}>
                    Adicionar memória
                  </Button>
                </div>
              )}

              {memories.length > 0 && (
                <div className="space-y-4">
                  {memories.map((mem, idx) => (
                    <div key={idx} className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <textarea
                          placeholder="Ex: O pai saiu de casa quando tinha 8 anos sem se despedir"
                          value={mem.content}
                          onChange={(e) => { const next = [...memories]; next[idx] = { ...next[idx], content: e.target.value }; setMemories(next) }}
                          className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
                          rows={2}
                        />
                        <button onClick={() => setMemories((p) => p.filter((_, i) => i !== idx))} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
                          <select
                            value={mem.memoryType}
                            onChange={(e) => { const next = [...memories]; next[idx] = { ...next[idx], memoryType: e.target.value }; setMemories(next) }}
                            className="w-full px-2 py-1.5 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm"
                          >
                            {MEMORY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <SliderField label="Importância" value={mem.importance} onChange={(v) => { const next = [...memories]; next[idx] = { ...next[idx], importance: v }; setMemories(next) }} min={0} max={1} step={0.05} compact />
                        <SliderField label="Carga emocional" value={mem.emotionalCharge} onChange={(v) => { const next = [...memories]; next[idx] = { ...next[idx], emotionalCharge: v }; setMemories(next) }} min={0} max={1} step={0.05} compact />
                      </div>

                      <div className="border-t border-border/40 pt-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mem.hasTrauma}
                            onChange={(e) => { const next = [...memories]; next[idx] = { ...next[idx], hasTrauma: e.target.checked }; setMemories(next) }}
                            className="accent-primary"
                          />
                          <span className="text-muted-foreground">Esta memória envolve trauma</span>
                        </label>

                        {mem.hasTrauma && (
                          <div className="mt-3 space-y-3 pl-6 border-l-2 border-amber-500/30">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Tipo de trauma</label>
                                <select
                                  value={mem.trauma.type}
                                  onChange={(e) => { const next = [...memories]; next[idx] = { ...next[idx], trauma: { ...next[idx].trauma, type: e.target.value } }; setMemories(next) }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm"
                                >
                                  {TRAUMA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Estado de processamento</label>
                                <select
                                  value={mem.trauma.processingStatus}
                                  onChange={(e) => { const next = [...memories]; next[idx] = { ...next[idx], trauma: { ...next[idx].trauma, processingStatus: e.target.value } }; setMemories(next) }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm"
                                >
                                  {PROCESSING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                              </div>
                            </div>
                            <SliderField label="Severidade" value={mem.trauma.severity} onChange={(v) => { const next = [...memories]; next[idx] = { ...next[idx], trauma: { ...next[idx].trauma, severity: v } }; setMemories(next) }} min={0} max={1} step={0.05} leftLabel="Leve" rightLabel="Severo" />
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Triggers</label>
                              <TagInput tags={mem.trauma.triggers} onChange={(v) => { const next = [...memories]; next[idx] = { ...next[idx], trauma: { ...next[idx].trauma, triggers: v } }; setMemories(next) }} placeholder="Ex: Despedidas" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Crenças formadas</label>
                              <TagInput tags={mem.trauma.beliefsFormed} onChange={(v) => { const next = [...memories]; next[idx] = { ...next[idx], trauma: { ...next[idx].trauma, beliefsFormed: v } }; setMemories(next) }} placeholder="Ex: As pessoas vão-se embora" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setMemories((p) => [...p, emptyMemory()])}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar memória
                  </Button>
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* ── STEP 7: Worldview & Summary ── */}
        {step === 7 && (
          <div className="space-y-6">
            <SectionHeader title="Visão do Mundo & Resumo" subtitle="Crenças filosóficas, estágio de vida e revisão final." />

            <Panel title="Visão do mundo">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Orientação filosófica</label>
                  <Input placeholder="Ex: Existencialista pragmática" value={worldview.philosophicalOrientation} onChange={(e) => setWorldview((p) => ({ ...p, philosophicalOrientation: e.target.value }))} />
                </div>
                <TextArea label="Acredita sobre a natureza humana" placeholder="Ex: As pessoas são egoístas mas capazes de bondade" value={worldview.believesAbout.humanNature} onChange={(v) => setWorldview((p) => ({ ...p, believesAbout: { ...p.believesAbout, humanNature: v } }))} />
                <TextArea label="Acredita sobre o amor" placeholder="Ex: Existe mas é perigoso" value={worldview.believesAbout.love} onChange={(v) => setWorldview((p) => ({ ...p, believesAbout: { ...p.believesAbout, love: v } }))} />
                <TextArea label="Acredita sobre confiança" placeholder="Ex: Tem de ser conquistada e pode ser destruída num instante" value={worldview.believesAbout.trust} onChange={(v) => setWorldview((p) => ({ ...p, believesAbout: { ...p.believesAbout, trust: v } }))} />
              </div>
            </Panel>

            <Collapsible title="Arco de crescimento" subtitle="Estágio de desenvolvimento e história terapêutica">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estágio de Erikson</label>
                  <select
                    value={growthArc.currentEriksonStage}
                    onChange={(e) => setGrowthArc((p) => ({ ...p, currentEriksonStage: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {ERIKSON_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado terapêutico</label>
                  <select
                    value={growthArc.therapyStatus}
                    onChange={(e) => setGrowthArc((p) => ({ ...p, therapyStatus: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {THERAPY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Arrependimentos</label>
                  <TagInput tags={growthArc.regrets} onChange={(v) => setGrowthArc((p) => ({ ...p, regrets: v }))} placeholder="Ex: Não ter confrontado o pai" />
                </div>
              </div>
            </Collapsible>

            <Panel title="Resumo">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <SummaryItem label="Nome" value={name || "—"} />
                <SummaryItem label="Avatar" value={avatar} />
                <SummaryItem label="Vinculação" value={ATTACHMENT_STYLES.find((s) => s.value === attachmentStyle)?.label || attachmentStyle} />
                <SummaryItem label="Pensamento" value={THINKING_STYLES.find((s) => s.value === thinkingStyle)?.label || thinkingStyle} />
                <SummaryItem label="Decisão" value={DECISION_APPROACHES.find((s) => s.value === decisionApproach)?.label || decisionApproach} />
                <SummaryItem label="Micro-agentes" value={`${microAgents.length}`} />
                <SummaryItem label="Memórias" value={`${memories.filter((m) => m.content.trim()).length}`} />
                <SummaryItem label="Valores" value={values.length > 0 ? values.join(", ") : "—"} />
                <SummaryItem label="Medos" value={fears.length > 0 ? fears.join(", ") : "—"} />
                <SummaryItem label="Triggers" value={`${emotionalTriggers.filter((t) => t.trigger).length}`} />
                <SummaryItem label="Regras" value={`${rules.length}`} />
                <SummaryItem label="Contradições" value={`${contradictions.length}`} />
              </dl>
            </Panel>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 gap-3">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || submitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))} disabled={!canAdvance() || submitting} className="gap-2">
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
                  A criar...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Criar humano virtual
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helper Components ───────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-7">
      {title && <h3 className="text-base font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  )
}

function Collapsible({ title, subtitle, children, compact }: { title: string; subtitle?: string; children: React.ReactNode; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border border-border/50 bg-card/40 overflow-hidden ${compact ? "" : ""}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-card/60 transition-colors" type="button">
        <div>
          <p className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}>{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className={`px-6 pb-6 space-y-4 ${compact ? "pt-0" : ""}`}>{children}</div>}
    </div>
  )
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("")
  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
      setInput("")
    }
  }
  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={add} disabled={!input.trim()} type="button" className="shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  leftLabel,
  rightLabel,
  compact,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  leftLabel?: string
  rightLabel?: string
  compact?: boolean
}) {
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className={`${compact ? "text-xs text-muted-foreground" : "text-sm font-medium"}`}>{label}</span>
          <span className="font-mono text-xs text-muted-foreground">{value.toFixed(2)}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  )
}

function TextArea({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        rows={2}
      />
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
  const blurbs: Record<string, string> = {
    logical: "Analisa estrutura, causa e efeito, consistência interna.",
    emotional: "Pondera o impacto emocional e a empatia na resposta.",
    critical: "Questiona premissas e procura falhas no raciocínio.",
    creative: "Gera alternativas, analogias e soluções originais.",
    ethical: "Avalia o que é justo, correcto ou prejudicial.",
    social: "Considera o contexto social e relacional.",
  }
  return blurbs[value] || ""
}
