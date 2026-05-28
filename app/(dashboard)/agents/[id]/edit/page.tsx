"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Plus,
} from "lucide-react"
import {
  getAgent,
  getPersonaBlueprint,
  updateAgent,
  updatePersonaBlueprint,
  Agent,
  THINKING_STYLES,
  DECISION_APPROACHES,
  DEFAULT_PERSONALITY,
  PERSONALITY_LABELS,
  AGENT_LANGUAGES,
} from "@/lib/agents"

// ─── Constants ───────────────────────────────────────────────────────────────

const ATTACHMENT_STYLES = [
  { value: "secure", label: "Seguro" },
  { value: "anxious-preoccupied", label: "Ansioso" },
  { value: "dismissive-avoidant", label: "Evitante" },
  { value: "fearful-avoidant", label: "Desorganizado" },
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

// ─── Types ───────────────────────────────────────────────────────────────────

type EditSection =
  | "identity"
  | "personality"
  | "values"
  | "emotions"
  | "behavior"
  | "worldview"

const SECTIONS: { key: EditSection; label: string }[] = [
  { key: "identity", label: "Identidade" },
  { key: "personality", label: "Personalidade" },
  { key: "values", label: "Mente & Valores" },
  { key: "emotions", label: "Emoções" },
  { key: "behavior", label: "Comportamento & Voz" },
  { key: "worldview", label: "Visão do Mundo" },
]

// ─── Main Component ─────────────────────────────────────────────────────────

export default function EditAgentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const agentId = params.id

  const [agent, setAgent] = useState<Agent | null>(null)
  const [blueprint, setBlueprint] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState<EditSection>("identity")

  // ── Basic fields ──
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [avatar, setAvatar] = useState("🤖")
  const [backgroundStory, setBackgroundStory] = useState("")
  const [thinkingStyle, setThinkingStyle] = useState("balanced")
  const [decisionApproach, setDecisionApproach] = useState("collaborative")
  const [debateIntensity, setDebateIntensity] = useState(0.7)

  // ── Identity ──
  const [selfConcept, setSelfConcept] = useState({ howTheySeeThemselves: "", howTheyWantToBeSeen: "", howTheyFearBeingSeen: "" })
  const [innerVoice, setInnerVoice] = useState({ tone: "", recurringPhrases: [] as string[] })
  const [language, setLanguage] = useState("pt-PT")
  const [impostorSyndrome, setImpostorSyndrome] = useState(0.3)

  // ── Personality ──
  const [attachmentStyle, setAttachmentStyle] = useState("secure")
  const [personality, setPersonality] = useState<Record<string, number>>({ ...DEFAULT_PERSONALITY })
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
  const [contradictions, setContradictions] = useState<string[]>([])
  const [masks, setMasks] = useState({ public: "", private: "" })
  const [shadow, setShadow] = useState("")
  const [humorStyle, setHumorStyle] = useState("")

  // ── Values & Mind ──
  const [values, setValues] = useState<string[]>([])
  const [fears, setFears] = useState<string[]>([])
  const [motivations, setMotivations] = useState<string[]>([])
  const [defenseMechanisms, setDefenseMechanisms] = useState({ habitual: [] as string[], moderateStress: [] as string[], extremeStress: [] as string[] })
  const [biases, setBiases] = useState<string[]>([])
  const [limitingBeliefs, setLimitingBeliefs] = useState<string[]>([])
  const [innerNarrative, setInnerNarrative] = useState("")

  // ── Emotions ──
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

  // ── Behavior ──
  const [communicationStyle, setCommunicationStyle] = useState({ default: "", whenComfortable: "", whenThreatened: "" })
  const [apologyStyle, setApologyStyle] = useState("")
  const [stressResponses, setStressResponses] = useState({ low: "", medium: "", high: "" })
  const [selfSabotagePatterns, setSelfSabotagePatterns] = useState<string[]>([])
  const [voice, setVoice] = useState({ sentenceStructure: "", commonExpressions: [] as string[], idiolect: [] as string[] })
  const [rules, setRules] = useState<string[]>([])
  const [consistencyAnchors, setConsistencyAnchors] = useState({ neverChanges: [] as string[], signatureBehaviors: [] as string[], hardBoundaries: [] as string[] })

  // ── Worldview ──
  const [worldview, setWorldview] = useState({ philosophicalOrientation: "", believesAbout: { humanNature: "", love: "", trust: "" } })
  const [growthArc, setGrowthArc] = useState({ currentEriksonStage: "", therapyStatus: "", regrets: [] as string[] })

  // ── Load data ──
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [agentData, blueprintData] = await Promise.allSettled([
        getAgent(agentId),
        getPersonaBlueprint(agentId),
      ])

      if (agentData.status === "fulfilled") {
        const a = agentData.value
        setAgent(a)
        setName(a.name)
        setDescription(a.description || "")
        setAvatar(a.avatar || "🤖")
        setBackgroundStory(a.background_story || "")
        setThinkingStyle(a.thinking_style)
        setDecisionApproach(a.decision_making_approach)
        setDebateIntensity(a.debate_intensity)
        setLanguage(a.language || "pt-PT")
        if (a.personality_traits) {
          setPersonality({ ...DEFAULT_PERSONALITY, ...a.personality_traits })
        }
      } else {
        setError("Falha ao carregar agente")
        return
      }

      if (blueprintData.status === "fulfilled") {
        const bp = blueprintData.value
        setBlueprint(bp)
        hydrateFromBlueprint(bp)
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [agentId])

  const hydrateFromBlueprint = (bp: Record<string, any>) => {
    const identity = bp.identity || {}
    const sc = identity.self_concept || {}
    setSelfConcept({
      howTheySeeThemselves: sc.how_they_see_themselves || "",
      howTheyWantToBeSeen: sc.how_they_want_to_be_seen || "",
      howTheyFearBeingSeen: sc.how_they_fear_being_seen || "",
    })
    const iv = identity.inner_voice || {}
    setInnerVoice({ tone: iv.tone || "", recurringPhrases: iv.recurring_phrases || [] })
    setImpostorSyndrome(identity.impostor_syndrome ?? 0.3)

    const pf = bp.personality_full || {}
    setAttachmentStyle(pf.attachment_style || "secure")
    const bigFive = pf.big_five?.natural || pf.big_five || {}
    const newFacets: Record<string, Record<string, number>> = {}
    for (const [trait, data] of Object.entries(bigFive)) {
      if (typeof data === "object" && data !== null) {
        const d = data as any
        if (d.score !== undefined) {
          setPersonality((prev) => ({ ...prev, [trait]: d.score }))
        }
        if (d.facets) {
          newFacets[trait] = d.facets
        }
      }
    }
    setFacets(newFacets)
    setContradictions(pf.contradictions || [])
    setMasks({ public: pf.masks?.public || "", private: pf.masks?.private || "" })
    setShadow(pf.shadow || "")
    setHumorStyle(pf.humor_style || "")
    const dm = pf.defense_mechanisms || {}
    setDefenseMechanisms({ habitual: dm.habitual || [], moderateStress: dm.moderate_stress || [], extremeStress: dm.extreme_stress || [] })
    setValues(pf.values || [])
    setFears(pf.fears || [])
    setMotivations(pf.motivations || [])

    const ec = bp.emotional_config || {}
    const pad = ec.baseline_emotions?.pad || {}
    setPadBaseline({ pleasure: pad.pleasure ?? 0.5, arousal: pad.arousal ?? 0.5, dominance: pad.dominance ?? 0.5 })
    setEmotionalTriggers(ec.emotional_triggers || [])
    setWindowOfTolerance(ec.emotional_regulation?.window_of_tolerance?.default_width ?? 0.5)

    const isc = bp.internal_states_config || {}
    const en = isc.energy || {}
    setEnergy({ baselineLevel: en.baseline_level ?? 0.6, recoveryRate: en.recovery_rate ?? 0.05, drainRate: en.drain_rate ?? 0.08 })
    const needs = isc.emotional_needs || {}
    setEmotionalNeeds({
      connection: { baseline: needs.connection?.baseline ?? 0.5, importance: needs.connection?.importance ?? 0.7 },
      validation: { baseline: needs.validation?.baseline ?? 0.5, importance: needs.validation?.importance ?? 0.7 },
      autonomy: { baseline: needs.autonomy?.baseline ?? 0.5, importance: needs.autonomy?.importance ?? 0.7 },
      safety: { baseline: needs.safety?.baseline ?? 0.5, importance: needs.safety?.importance ?? 0.7 },
    })
    const st = isc.stress || {}
    setStress({ baseline: st.baseline ?? 0.3, resilience: st.resilience ?? 0.6, breakingPoint: st.breaking_point ?? 0.9 })

    const cc = bp.cognitive_config || {}
    setBiases(cc.biases || [])
    setLimitingBeliefs(cc.limiting_beliefs || [])
    setInnerNarrative(cc.inner_narrative || "")

    const soc = bp.social_config || {}
    const cs = soc.communication_style || {}
    setCommunicationStyle({ default: cs.default || "", whenComfortable: cs.when_comfortable || "", whenThreatened: cs.when_threatened || "" })
    setApologyStyle(soc.apology_style || "")

    const bc = bp.behavioral_config || {}
    const sr = bc.stress_responses || {}
    setStressResponses({ low: sr.low || "", medium: sr.medium || "", high: sr.high || "" })
    setSelfSabotagePatterns(bc.self_sabotage_patterns || [])

    const bprompts = bp.behavior_prompts || {}
    const v = bprompts.voice || {}
    setVoice({ sentenceStructure: v.sentence_structure || "", commonExpressions: v.common_expressions || [], idiolect: v.idiolect || [] })
    setRules(bprompts.rules || [])
    const ca = bprompts.consistency_anchors || {}
    setConsistencyAnchors({ neverChanges: ca.never_changes || [], signatureBehaviors: ca.signature_behaviors || [], hardBoundaries: ca.hard_boundaries || [] })

    const wv = bp.worldview || {}
    setWorldview({
      philosophicalOrientation: wv.philosophical_orientation || "",
      believesAbout: {
        humanNature: wv.believes_about?.human_nature || "",
        love: wv.believes_about?.love || "",
        trust: wv.believes_about?.trust || "",
      },
    })

    const ga = bp.growth_arc || {}
    setGrowthArc({
      currentEriksonStage: ga.current_erikson_stage || "",
      therapyStatus: ga.therapy_status || "",
      regrets: ga.regrets || [],
    })
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Save ──
  const handleSave = async () => {
    if (!agent) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateAgent(agent.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        avatar,
        language,
        background_story: backgroundStory.trim() || undefined,
        thinking_style: thinkingStyle,
        decision_making_approach: decisionApproach,
        debate_intensity: debateIntensity,
        personality_traits: personality,
      } as any)

      const bigFive: Record<string, any> = {}
      for (const [trait, score] of Object.entries(personality)) {
        const entry: Record<string, any> = { score }
        if (facets[trait] && Object.keys(facets[trait]).length > 0) entry.facets = facets[trait]
        bigFive[trait] = entry
      }

      const sections: [string, Record<string, any>][] = [
        ["identity", {
          ...(selfConcept.howTheySeeThemselves || selfConcept.howTheyWantToBeSeen || selfConcept.howTheyFearBeingSeen
            ? { self_concept: { how_they_see_themselves: selfConcept.howTheySeeThemselves, how_they_want_to_be_seen: selfConcept.howTheyWantToBeSeen, how_they_fear_being_seen: selfConcept.howTheyFearBeingSeen } }
            : {}),
          ...(innerVoice.tone ? { inner_voice: { tone: innerVoice.tone, recurring_phrases: innerVoice.recurringPhrases } } : {}),
          languages: [language],
          impostor_syndrome: impostorSyndrome,
        }],
        ["personality_full", {
          attachment_style: attachmentStyle,
          big_five: { natural: bigFive },
          contradictions,
          masks: { public: masks.public, private: masks.private },
          shadow,
          humor_style: humorStyle,
          defense_mechanisms: { habitual: defenseMechanisms.habitual, moderate_stress: defenseMechanisms.moderateStress, extreme_stress: defenseMechanisms.extremeStress },
          values, fears, motivations,
        }],
        ["internal_states_config", {
          energy: { baseline_level: energy.baselineLevel, recovery_rate: energy.recoveryRate, drain_rate: energy.drainRate },
          emotional_needs: {
            connection: emotionalNeeds.connection, validation: emotionalNeeds.validation,
            autonomy: emotionalNeeds.autonomy, safety: emotionalNeeds.safety,
          },
          stress: { baseline: stress.baseline, resilience: stress.resilience, breaking_point: stress.breakingPoint },
        }],
        ["emotional_config", {
          baseline_emotions: { pad: padBaseline },
          emotional_triggers: emotionalTriggers.filter((t) => t.trigger && t.reaction),
          emotional_regulation: { window_of_tolerance: { default_width: windowOfTolerance } },
        }],
        ["cognitive_config", { biases, limiting_beliefs: limitingBeliefs, inner_narrative: innerNarrative }],
        ["social_config", {
          communication_style: { default: communicationStyle.default, when_comfortable: communicationStyle.whenComfortable, when_threatened: communicationStyle.whenThreatened },
          apology_style: apologyStyle,
        }],
        ["behavioral_config", {
          stress_responses: stressResponses,
          self_sabotage_patterns: selfSabotagePatterns,
        }],
        ["behavior_prompts", {
          voice: { sentence_structure: voice.sentenceStructure, common_expressions: voice.commonExpressions, idiolect: voice.idiolect },
          rules,
          consistency_anchors: { never_changes: consistencyAnchors.neverChanges, signature_behaviors: consistencyAnchors.signatureBehaviors, hard_boundaries: consistencyAnchors.hardBoundaries },
        }],
        ["worldview", {
          philosophical_orientation: worldview.philosophicalOrientation,
          believes_about: { human_nature: worldview.believesAbout.humanNature, love: worldview.believesAbout.love, trust: worldview.believesAbout.trust },
        }],
        ["growth_arc", {
          current_erikson_stage: growthArc.currentEriksonStage,
          therapy_status: growthArc.therapyStatus,
          regrets: growthArc.regrets,
        }],
      ]

      if (blueprint) {
        await Promise.all(
          sections.map(([section, data]) => updatePersonaBlueprint(agent.id, section, data))
        )
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || "Falha ao guardar")
    } finally {
      setSaving(false)
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
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400/60" />
          <p className="text-sm text-muted-foreground mb-3">{error || "Agente não encontrado"}</p>
          <Link href="/agents"><Button variant="outline" size="sm"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Voltar</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href={`/agents/${agent.id}`}>
                <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">Editar {agent.name}</h1>
                <p className="text-sm text-muted-foreground">{SECTIONS.find((s) => s.key === activeSection)?.label}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || !name.trim()} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </Button>
          </div>

          {/* Section tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1 -mb-1">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                  activeSection === s.key ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Guardado com sucesso.
          </div>
        )}

        {/* ── Identity ── */}
        {activeSection === "identity" && (
          <div className="space-y-6">
            <Panel title="Informação básica">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input value={avatar} onChange={(e) => setAvatar(e.target.value.slice(0, 4))} className="w-20 text-center text-2xl h-12" maxLength={4} />
                  <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
                </div>
                <TextArea label="Descrição" value={description} onChange={setDescription} placeholder="Descrição curta" />
                <TextArea label="História de fundo" value={backgroundStory} onChange={setBackgroundStory} placeholder="Contexto e experiências" />
              </div>
            </Panel>

            <Panel title="Auto-conceito">
              <div className="space-y-4">
                <TextArea label="Como se vê a si própria" value={selfConcept.howTheySeeThemselves} onChange={(v) => setSelfConcept((p) => ({ ...p, howTheySeeThemselves: v }))} />
                <TextArea label="Como quer ser vista" value={selfConcept.howTheyWantToBeSeen} onChange={(v) => setSelfConcept((p) => ({ ...p, howTheyWantToBeSeen: v }))} />
                <TextArea label="Como teme ser vista" value={selfConcept.howTheyFearBeingSeen} onChange={(v) => setSelfConcept((p) => ({ ...p, howTheyFearBeingSeen: v }))} />
              </div>
            </Panel>

            <Panel title="Voz interior">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tom</label>
                  <Input value={innerVoice.tone} onChange={(e) => setInnerVoice((p) => ({ ...p, tone: e.target.value }))} placeholder="Ex: Crítica mas esperançosa" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frases recorrentes</label>
                  <TagInput tags={innerVoice.recurringPhrases} onChange={(v) => setInnerVoice((p) => ({ ...p, recurringPhrases: v }))} placeholder="Adicionar frase" />
                </div>
              </div>
            </Panel>

            <Panel title="Idioma">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {AGENT_LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setLanguage(lang.value)}
                      className={`text-left rounded-xl p-4 border-2 transition-all flex items-center gap-3 ${
                        language === lang.value ? "border-primary/60 bg-primary/10" : "border-border/50 bg-card/30 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="font-semibold text-sm">{lang.label}</p>
                        <p className="text-xs text-muted-foreground">{lang.value === "en-US" ? "Com tons emocionais" : "Voz natural"}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <SliderField label="Síndrome do impostor" value={impostorSyndrome} onChange={setImpostorSyndrome} leftLabel="Inexistente" rightLabel="Forte" />
              </div>
            </Panel>
          </div>
        )}

        {/* ── Personality ── */}
        {activeSection === "personality" && (
          <div className="space-y-6">
            <Panel title="Estilo de vinculação">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ATTACHMENT_STYLES.map((a) => (
                  <button key={a.value} onClick={() => setAttachmentStyle(a.value)} className={`rounded-xl p-3 border-2 text-sm transition-all ${attachmentStyle === a.value ? "border-primary/60 bg-primary/10 font-medium" : "border-border/50 bg-card/30 hover:border-primary/30"}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Big Five">
              <div className="space-y-5">
                {Object.entries(PERSONALITY_LABELS).map(([key, meta]) => (
                  <div key={key}>
                    <SliderField label={meta.label} value={personality[key] ?? 0.5} onChange={(v) => setPersonality((p) => ({ ...p, [key]: v }))} />
                    {BIG_FIVE_FACETS[key] && (
                      <Collapsible title={`Facetas`} compact>
                        <div className="space-y-3">
                          {BIG_FIVE_FACETS[key].map((f) => (
                            <SliderField key={f.key} label={f.label} value={facets[key]?.[f.key] ?? personality[key] ?? 0.5} onChange={(v) => setFacets((p) => ({ ...p, [key]: { ...(p[key] || {}), [f.key]: v } }))} compact />
                          ))}
                        </div>
                      </Collapsible>
                    )}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Contradições & Máscaras">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contradições internas</label>
                  <TagInput tags={contradictions} onChange={setContradictions} placeholder="Adicionar contradição" />
                </div>
                <TextArea label="Máscara pública" value={masks.public} onChange={(v) => setMasks((p) => ({ ...p, public: v }))} />
                <TextArea label="Eu privado" value={masks.private} onChange={(v) => setMasks((p) => ({ ...p, private: v }))} />
                <TextArea label="Sombra" value={shadow} onChange={setShadow} />
                <div>
                  <label className="block text-sm font-medium mb-2">Estilo de humor</label>
                  <Input value={humorStyle} onChange={(e) => setHumorStyle(e.target.value)} />
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* ── Values & Mind ── */}
        {activeSection === "values" && (
          <div className="space-y-6">
            <Panel title="Cognição">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Estilo de pensamento</label>
                    <select value={thinkingStyle} onChange={(e) => setThinkingStyle(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm">
                      {THINKING_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Decisão</label>
                    <select value={decisionApproach} onChange={(e) => setDecisionApproach(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-sm">
                      {DECISION_APPROACHES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <SliderField label="Intensidade de debate" value={debateIntensity} onChange={setDebateIntensity} leftLabel="Harmonioso" rightLabel="Intenso" />
              </div>
            </Panel>

            <Panel title="Valores, Medos & Motivações">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Valores</label><TagInput tags={values} onChange={setValues} placeholder="Adicionar valor" /></div>
                <div><label className="block text-sm font-medium mb-2">Medos</label><TagInput tags={fears} onChange={setFears} placeholder="Adicionar medo" /></div>
                <div><label className="block text-sm font-medium mb-2">Motivações</label><TagInput tags={motivations} onChange={setMotivations} placeholder="Adicionar motivação" /></div>
              </div>
            </Panel>

            <Panel title="Mecanismos de defesa">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Habituais</label><TagInput tags={defenseMechanisms.habitual} onChange={(v) => setDefenseMechanisms((p) => ({ ...p, habitual: v }))} placeholder="Ex: Intelectualização" /></div>
                <div><label className="block text-sm font-medium mb-2">Stress moderado</label><TagInput tags={defenseMechanisms.moderateStress} onChange={(v) => setDefenseMechanisms((p) => ({ ...p, moderateStress: v }))} placeholder="Ex: Projecção" /></div>
                <div><label className="block text-sm font-medium mb-2">Stress extremo</label><TagInput tags={defenseMechanisms.extremeStress} onChange={(v) => setDefenseMechanisms((p) => ({ ...p, extremeStress: v }))} placeholder="Ex: Dissociação" /></div>
              </div>
            </Panel>

            <Panel title="Cognição">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Vieses cognitivos</label><TagInput tags={biases} onChange={setBiases} placeholder="Ex: Catastrofizar" /></div>
                <div><label className="block text-sm font-medium mb-2">Crenças limitantes</label><TagInput tags={limitingBeliefs} onChange={setLimitingBeliefs} placeholder="Adicionar crença" /></div>
                <TextArea label="Narrativa interna" value={innerNarrative} onChange={setInnerNarrative} placeholder="A história que conta a si mesma" />
              </div>
            </Panel>
          </div>
        )}

        {/* ── Emotions ── */}
        {activeSection === "emotions" && (
          <div className="space-y-6">
            <Panel title="Baseline emocional (PAD)">
              <div className="space-y-4">
                <SliderField label="Prazer" value={padBaseline.pleasure} onChange={(v) => setPadBaseline((p) => ({ ...p, pleasure: v }))} min={-1} max={1} leftLabel="Desprazer" rightLabel="Prazer" />
                <SliderField label="Activação" value={padBaseline.arousal} onChange={(v) => setPadBaseline((p) => ({ ...p, arousal: v }))} leftLabel="Calmo" rightLabel="Activado" />
                <SliderField label="Dominância" value={padBaseline.dominance} onChange={(v) => setPadBaseline((p) => ({ ...p, dominance: v }))} leftLabel="Submisso" rightLabel="Dominante" />
              </div>
            </Panel>

            <Panel title="Triggers emocionais">
              {emotionalTriggers.map((t, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <Input placeholder="Trigger" value={t.trigger} onChange={(e) => { const next = [...emotionalTriggers]; next[i] = { ...next[i], trigger: e.target.value }; setEmotionalTriggers(next) }} className="flex-1" />
                  <Input placeholder="Reacção" value={t.reaction} onChange={(e) => { const next = [...emotionalTriggers]; next[i] = { ...next[i], reaction: e.target.value }; setEmotionalTriggers(next) }} className="flex-1" />
                  <button onClick={() => setEmotionalTriggers((p) => p.filter((_, j) => j !== i))} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setEmotionalTriggers((p) => [...p, { trigger: "", reaction: "" }])}><Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar</Button>
            </Panel>

            <Panel title="Janela de tolerância">
              <SliderField label="" value={windowOfTolerance} onChange={setWindowOfTolerance} min={0.1} leftLabel="Estreita" rightLabel="Ampla" />
            </Panel>

            <Panel title="Energia">
              <div className="space-y-4">
                <SliderField label="Nível base" value={energy.baselineLevel} onChange={(v) => setEnergy((p) => ({ ...p, baselineLevel: v }))} />
                <SliderField label="Taxa de recuperação" value={energy.recoveryRate} onChange={(v) => setEnergy((p) => ({ ...p, recoveryRate: v }))} min={0.01} max={0.2} step={0.01} />
                <SliderField label="Taxa de desgaste" value={energy.drainRate} onChange={(v) => setEnergy((p) => ({ ...p, drainRate: v }))} min={0.01} max={0.2} step={0.01} />
              </div>
            </Panel>

            <Panel title="Necessidades emocionais">
              <div className="space-y-5">
                {(["connection", "validation", "autonomy", "safety"] as const).map((need) => {
                  const labels: Record<string, string> = { connection: "Conexão", validation: "Validação", autonomy: "Autonomia", safety: "Segurança" }
                  return (
                    <div key={need} className="space-y-2">
                      <p className="text-sm font-medium">{labels[need]}</p>
                      <SliderField label="Base" value={emotionalNeeds[need].baseline} onChange={(v) => setEmotionalNeeds((p) => ({ ...p, [need]: { ...p[need], baseline: v } }))} compact />
                      <SliderField label="Importância" value={emotionalNeeds[need].importance} onChange={(v) => setEmotionalNeeds((p) => ({ ...p, [need]: { ...p[need], importance: v } }))} compact />
                    </div>
                  )
                })}
              </div>
            </Panel>

            <Panel title="Stress">
              <div className="space-y-4">
                <SliderField label="Nível base" value={stress.baseline} onChange={(v) => setStress((p) => ({ ...p, baseline: v }))} leftLabel="Calmo" rightLabel="Stressado" />
                <SliderField label="Resiliência" value={stress.resilience} onChange={(v) => setStress((p) => ({ ...p, resilience: v }))} leftLabel="Frágil" rightLabel="Resiliente" />
                <SliderField label="Ponto de ruptura" value={stress.breakingPoint} onChange={(v) => setStress((p) => ({ ...p, breakingPoint: v }))} min={0.5} />
              </div>
            </Panel>
          </div>
        )}

        {/* ── Behavior ── */}
        {activeSection === "behavior" && (
          <div className="space-y-6">
            <Panel title="Estilo de comunicação">
              <div className="space-y-4">
                <TextArea label="Por defeito" value={communicationStyle.default} onChange={(v) => setCommunicationStyle((p) => ({ ...p, default: v }))} />
                <TextArea label="Quando confortável" value={communicationStyle.whenComfortable} onChange={(v) => setCommunicationStyle((p) => ({ ...p, whenComfortable: v }))} />
                <TextArea label="Quando ameaçada" value={communicationStyle.whenThreatened} onChange={(v) => setCommunicationStyle((p) => ({ ...p, whenThreatened: v }))} />
              </div>
            </Panel>

            <Panel>
              <TextArea label="Estilo de pedido de desculpa" value={apologyStyle} onChange={setApologyStyle} />
            </Panel>

            <Panel title="Respostas ao stress">
              <div className="space-y-4">
                <TextArea label="Stress baixo" value={stressResponses.low} onChange={(v) => setStressResponses((p) => ({ ...p, low: v }))} />
                <TextArea label="Stress médio" value={stressResponses.medium} onChange={(v) => setStressResponses((p) => ({ ...p, medium: v }))} />
                <TextArea label="Stress alto" value={stressResponses.high} onChange={(v) => setStressResponses((p) => ({ ...p, high: v }))} />
              </div>
            </Panel>

            <Panel>
              <label className="block text-sm font-medium mb-2">Padrões de auto-sabotagem</label>
              <TagInput tags={selfSabotagePatterns} onChange={setSelfSabotagePatterns} placeholder="Adicionar padrão" />
            </Panel>

            <Panel title="Voz">
              <div className="space-y-4">
                <TextArea label="Estrutura de frases" value={voice.sentenceStructure} onChange={(v) => setVoice((p) => ({ ...p, sentenceStructure: v }))} />
                <div><label className="block text-sm font-medium mb-2">Expressões comuns</label><TagInput tags={voice.commonExpressions} onChange={(v) => setVoice((p) => ({ ...p, commonExpressions: v }))} placeholder="Adicionar" /></div>
                <div><label className="block text-sm font-medium mb-2">Idiolecto</label><TagInput tags={voice.idiolect} onChange={(v) => setVoice((p) => ({ ...p, idiolect: v }))} placeholder="Adicionar" /></div>
              </div>
            </Panel>

            <Panel>
              <label className="block text-sm font-medium mb-2">Regras comportamentais</label>
              <TagInput tags={rules} onChange={setRules} placeholder="Adicionar regra" />
            </Panel>

            <Panel title="Âncoras de consistência">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Nunca muda</label><TagInput tags={consistencyAnchors.neverChanges} onChange={(v) => setConsistencyAnchors((p) => ({ ...p, neverChanges: v }))} placeholder="Adicionar" /></div>
                <div><label className="block text-sm font-medium mb-2">Comportamentos assinatura</label><TagInput tags={consistencyAnchors.signatureBehaviors} onChange={(v) => setConsistencyAnchors((p) => ({ ...p, signatureBehaviors: v }))} placeholder="Adicionar" /></div>
                <div><label className="block text-sm font-medium mb-2">Limites inegociáveis</label><TagInput tags={consistencyAnchors.hardBoundaries} onChange={(v) => setConsistencyAnchors((p) => ({ ...p, hardBoundaries: v }))} placeholder="Adicionar" /></div>
              </div>
            </Panel>
          </div>
        )}

        {/* ── Worldview ── */}
        {activeSection === "worldview" && (
          <div className="space-y-6">
            <Panel title="Visão do mundo">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Orientação filosófica</label>
                  <Input value={worldview.philosophicalOrientation} onChange={(e) => setWorldview((p) => ({ ...p, philosophicalOrientation: e.target.value }))} placeholder="Ex: Existencialista pragmática" />
                </div>
                <TextArea label="Sobre a natureza humana" value={worldview.believesAbout.humanNature} onChange={(v) => setWorldview((p) => ({ ...p, believesAbout: { ...p.believesAbout, humanNature: v } }))} />
                <TextArea label="Sobre o amor" value={worldview.believesAbout.love} onChange={(v) => setWorldview((p) => ({ ...p, believesAbout: { ...p.believesAbout, love: v } }))} />
                <TextArea label="Sobre confiança" value={worldview.believesAbout.trust} onChange={(v) => setWorldview((p) => ({ ...p, believesAbout: { ...p.believesAbout, trust: v } }))} />
              </div>
            </Panel>

            <Panel title="Arco de crescimento">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estágio de Erikson</label>
                  <select value={growthArc.currentEriksonStage} onChange={(e) => setGrowthArc((p) => ({ ...p, currentEriksonStage: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-sm">
                    <option value="">Seleccionar...</option>
                    {ERIKSON_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado terapêutico</label>
                  <select value={growthArc.therapyStatus} onChange={(e) => setGrowthArc((p) => ({ ...p, therapyStatus: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/40 text-sm">
                    <option value="">Seleccionar...</option>
                    {THERAPY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Arrependimentos</label>
                  <TagInput tags={growthArc.regrets} onChange={(v) => setGrowthArc((p) => ({ ...p, regrets: v }))} placeholder="Adicionar" />
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helper Components ───────────────────────────────────────────────────────

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      {title && <h3 className="text-base font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  )
}

function Collapsible({ title, children, compact }: { title: string; children: React.ReactNode; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden mt-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-card/60 transition-colors" type="button">
        <p className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>{title}</p>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("")
  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) { onChange([...tags, val]); setInput("") }
  }
  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-400"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }} placeholder={placeholder} className="flex-1" />
        <Button variant="outline" size="sm" onClick={add} disabled={!input.trim()} type="button" className="shrink-0"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  )
}

function SliderField({ label, value, onChange, min = 0, max = 1, step = 0.05, leftLabel, rightLabel, compact }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; leftLabel?: string; rightLabel?: string; compact?: boolean
}) {
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className={compact ? "text-xs text-muted-foreground" : "text-sm font-medium"}>{label}</span>
          <span className="font-mono text-xs text-muted-foreground">{value.toFixed(2)}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">
          <span>{leftLabel}</span><span>{rightLabel}</span>
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
