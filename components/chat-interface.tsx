"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Volume2, VolumeX, Settings, Bot, Plus, Heart, Brain, Flame, Timer, RotateCcw, Trash2, MoreVertical } from "lucide-react"
import { Agent, chatWithAgent, getAgentGreeting, resetAgentConversation, type ThoughtContribution } from "@/lib/agents"
import { MemoryManager } from "@/components/memory-manager"
import { getSavedVoiceGender, saveVoiceGender, type VoiceGender } from "@/lib/tts"
import { cleanForDisplay, cleanForTTS } from "@/lib/text-clean"

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatInterfaceProps {
  agent: Agent | null
  onBotMessage?: (text: string, emotionalState?: Record<string, any>) => void
  onThoughts?: (thoughts: ThoughtContribution[]) => void
}

export function ChatInterface({ agent, onBotMessage, onThoughts }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [trustLevel, setTrustLevel] = useState<number | null>(null)
  const [modelConfidence, setModelConfidence] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState<number | null>(null)
  const [responseMs, setResponseMs] = useState<number | null>(null)
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showMemoryManager, setShowMemoryManager] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const greetingRequestRef = useRef(0)
  const voiceEnabledRef = useRef(voiceEnabled)
  const onBotMessageRef = useRef(onBotMessage)

  useEffect(() => {
    setVoiceGender(getSavedVoiceGender())
  }, [])

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled
  }, [voiceEnabled])

  useEffect(() => {
    onBotMessageRef.current = onBotMessage
  }, [onBotMessage])

  // Reset ao trocar de agente + saudação dinâmica
  useEffect(() => {
    setConversationId(undefined)
    setError(null)
    setTrustLevel(null)
    setModelConfidence(null)
    setStressLevel(null)
    setResponseMs(null)
    if (!agent) {
      setMessages([])
      return
    }
    setMessages([])
    setIsTyping(true)
    const requestId = ++greetingRequestRef.current
    let cancelled = false
    getAgentGreeting(agent.id)
      .then((data) => {
        if (cancelled || requestId !== greetingRequestRef.current) return
        if (typeof data.relationship?.trust_level === "number") {
          setTrustLevel(Math.max(0, Math.min(1, data.relationship.trust_level)))
        }
        const stress = data.persona_state?.stress_level
        if (typeof stress === "number") {
          setStressLevel(Math.max(0, Math.min(1, stress)))
        }
        if (typeof data.confidence === "number") {
          setModelConfidence(Math.max(0, Math.min(1, data.confidence)))
        }
        if (!data.should_greet || !data.greeting?.trim()) {
          setMessages([])
          return
        }
        const greetingText = cleanForDisplay(data.greeting)
        setMessages([{
          id: Date.now(),
          text: greetingText,
          isUser: false,
          timestamp: new Date(),
        }])
        if (voiceEnabledRef.current) onBotMessageRef.current?.(cleanForTTS(greetingText), data.persona_state)
      })
      .catch(() => {
        if (!cancelled && requestId === greetingRequestRef.current) setMessages([])
      })
      .finally(() => {
        if (!cancelled && requestId === greetingRequestRef.current) setIsTyping(false)
      })
    return () => {
      cancelled = true
    }
  }, [agent?.id])

  // Auto-scroll ao receber mensagens novas
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  const handleNewConversation = async () => {
    if (!agent) return
    setShowActionsMenu(false)
    try {
      await resetAgentConversation(agent.id)
    } catch {}
    setConversationId(undefined)
    setMessages([])
    setError(null)
    setTrustLevel(null)
    setModelConfidence(null)
    setStressLevel(null)
    setResponseMs(null)
    setIsTyping(true)
    const requestId = ++greetingRequestRef.current
    getAgentGreeting(agent.id)
      .then((data) => {
        if (requestId !== greetingRequestRef.current) return
        if (typeof data.relationship?.trust_level === "number") setTrustLevel(Math.max(0, Math.min(1, data.relationship.trust_level)))
        if (typeof data.persona_state?.stress_level === "number") setStressLevel(Math.max(0, Math.min(1, data.persona_state.stress_level)))
        if (typeof data.confidence === "number") setModelConfidence(Math.max(0, Math.min(1, data.confidence)))
        if (!data.should_greet || !data.greeting?.trim()) { setMessages([]); return }
        const greetingText = cleanForDisplay(data.greeting)
        setMessages([{ id: Date.now(), text: greetingText, isUser: false, timestamp: new Date() }])
        if (voiceEnabledRef.current) onBotMessageRef.current?.(cleanForTTS(greetingText), data.persona_state)
      })
      .catch(() => { if (requestId === greetingRequestRef.current) setMessages([]) })
      .finally(() => { if (requestId === greetingRequestRef.current) setIsTyping(false) })
  }

  const handleOpenMemories = () => {
    setShowActionsMenu(false)
    setShowMemoryManager(true)
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    if (!agent) {
      setError("Seleciona um agente primeiro.")
      return
    }

    const text = input.trim()
    setInput("")
    setError(null)
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, isUser: true, timestamp: new Date() },
    ])
    setIsTyping(true)

    try {
      const resp = await chatWithAgent(agent.id, text, conversationId)
      if (resp.conversation_id) setConversationId(resp.conversation_id)
      const rawText = resp.agent_response || "(sem resposta)"
      const displayText = cleanForDisplay(rawText)
      if (typeof resp.relationship?.trust_level === "number") {
        setTrustLevel(Math.max(0, Math.min(1, resp.relationship.trust_level)))
      }
      if (typeof resp.confidence === "number") {
        setModelConfidence(Math.max(0, Math.min(1, resp.confidence)))
      }
      const stress = resp.persona_state?.stress_level ?? resp.emotional_state?.stress
      if (typeof stress === "number") {
        setStressLevel(Math.max(0, Math.min(1, stress)))
      }
      if (typeof resp.duration_ms === "number") {
        setResponseMs(Math.max(0, resp.duration_ms))
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: displayText, isUser: false, timestamp: new Date() },
      ])
      if (voiceEnabled) onBotMessage?.(cleanForTTS(rawText), resp.emotional_state)
      if (resp.thought_contributions?.length) onThoughts?.(resp.thought_contributions)
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar mensagem")
    } finally {
      setIsTyping(false)
    }
  }

  if (!agent) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/30 ">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted rounded-full" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">Sem agente</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
          <Bot className="w-10 h-10 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-semibold text-foreground">Nenhum agente selecionado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Cria um agente ou escolhe um existente para começar a conversar.
            </p>
          </div>
          <Link href="/agents">
            <Button size="sm" className="gap-2">
              <Plus className="w-3.5 h-3.5" />
              Gerir agentes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="relative z-30 flex items-start justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/30 overflow-visible">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{agent.avatar || "🤖"}</span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{agent.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {conversationId ? `conversa #${conversationId.slice(0, 8)}` : "nova conversa"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 flex-wrap max-w-[220px] sm:max-w-[260px] shrink-0">
          <div
            className="h-7 px-1.5 rounded-md border border-border/60 bg-card/50 flex items-center gap-1 min-w-0"
            title={modelConfidence !== null ? `Confiança da resposta: ${Math.round(modelConfidence * 100)}%` : "Confiança da resposta"}
          >
            <Brain className={`h-3.5 w-3.5 ${modelConfidence !== null && modelConfidence >= 0.7 ? "text-emerald-400" : "text-muted-foreground"}`} />
            <span className="text-[10px] text-foreground/80">
              {modelConfidence !== null ? `${Math.round(modelConfidence * 100)}%` : "—"}
            </span>
          </div>
          <div
            className="h-7 px-1.5 rounded-md border border-border/60 bg-card/50 flex items-center gap-1 min-w-0"
            title={stressLevel !== null ? `Stress atual da persona: ${Math.round(stressLevel * 100)}%` : "Stress da persona"}
          >
            <Flame className={`h-3.5 w-3.5 ${stressLevel !== null && stressLevel >= 0.7 ? "text-red-400" : "text-muted-foreground"}`} />
            <span className="text-[10px] text-foreground/80">
              {stressLevel !== null ? `${Math.round(stressLevel * 100)}%` : "—"}
            </span>
          </div>
          <div
            className="h-7 px-1.5 rounded-md border border-border/60 bg-card/50 flex items-center gap-1 min-w-0"
            title={trustLevel !== null ? `Confiança do bot em ti: ${Math.round(trustLevel * 100)}%` : "Confiança ainda sem dados"}
          >
            <Heart className={`h-3.5 w-3.5 ${trustLevel !== null && trustLevel >= 0.7 ? "text-emerald-400" : "text-muted-foreground"}`} />
            <span className="text-[10px] text-foreground/80">
              {trustLevel !== null ? `${Math.round(trustLevel * 100)}%` : "—"}
            </span>
          </div>
          <div
            className="h-7 px-1.5 rounded-md border border-border/60 bg-card/50 flex items-center gap-1 min-w-0"
            title={responseMs !== null ? `Tempo de resposta: ${responseMs}ms` : "Tempo de resposta"}
          >
            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-foreground/80">
              {responseMs !== null ? `${Math.round(responseMs / 1000)}s` : "—"}
            </span>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-card/50 transition-colors"
              onClick={() => { setShowVoiceMenu(!showVoiceMenu); setShowActionsMenu(false) }}
              title={voiceEnabled ? "Voz ativa" : "Voz desativada"}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </Button>
            {showVoiceMenu && (
              <div className="absolute right-0 top-full mt-1 z-[100] bg-card border border-border rounded-lg shadow-xl p-2 min-w-[160px] animate-appear">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-card/80 transition-colors"
                  onClick={() => { setVoiceEnabled(!voiceEnabled); setShowVoiceMenu(false) }}
                >
                  {voiceEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{voiceEnabled ? "Desativar voz" : "Ativar voz"}</span>
                </button>
                <div className="border-t border-border/50 my-1" />
                <p className="px-3 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Género da voz</p>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors ${voiceGender === "female" ? "bg-primary/15 text-primary" : "hover:bg-card/80"}`}
                  onClick={() => { setVoiceGender("female"); saveVoiceGender("female"); setShowVoiceMenu(false) }}
                >
                  <span>👩</span>
                  <span>Feminina</span>
                  {voiceGender === "female" && <span className="ml-auto text-primary">✓</span>}
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors ${voiceGender === "male" ? "bg-primary/15 text-primary" : "hover:bg-card/80"}`}
                  onClick={() => { setVoiceGender("male"); saveVoiceGender("male"); setShowVoiceMenu(false) }}
                >
                  <span>👨</span>
                  <span>Masculina</span>
                  {voiceGender === "male" && <span className="ml-auto text-primary">✓</span>}
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-card/50 transition-colors"
              onClick={() => { setShowActionsMenu(!showActionsMenu); setShowVoiceMenu(false) }}
              title="Opções"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showActionsMenu && (
              <div className="absolute right-0 top-full mt-1 z-[100] bg-card border border-border rounded-lg shadow-xl p-2 min-w-[180px] animate-appear">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-card/80 transition-colors"
                  onClick={handleNewConversation}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nova conversa</span>
                </button>
                <div className="border-t border-border/50 my-1" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-card/80 transition-colors"
                  onClick={handleOpenMemories}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Gerir memorias</span>
                </button>
              </div>
            )}
          </div>
          <Link href={`/agents/${agent.id}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-card/50 transition-colors" title="Configurar agente">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0 bg-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 animate-appear ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3  transition-all ${
                message.isUser
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-gradient-to-br from-card to-card/60 text-foreground border border-border/50 shadow-lg shadow-card/10"
              }`}
            >
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className={`text-[10px] opacity-60 mt-1 block ${message.isUser ? "opacity-70" : "opacity-50"}`}>
                {message.timestamp.toLocaleString("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-appear">
            <div className="bg-gradient-to-br from-card to-card/60 rounded-2xl px-4 py-3 border border-border/50 shadow-lg shadow-card/10">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-3 py-1.5 text-[11px] text-red-300 bg-red-500/10 border-t border-red-500/20">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-2.5 sm:p-4 border-t border-border bg-card/30 ">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Fala com ${agent.name}...`}
            disabled={isTyping}
            className="h-9 sm:h-10 bg-input border-border/50 rounded-full px-3 sm:px-4 text-sm focus:border-primary/50 transition-all"
          />

          <Button
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0 transition-all hover:shadow-lg hover:shadow-primary/30"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MemoryManager agentId={agent.id} open={showMemoryManager} onOpenChange={setShowMemoryManager} />
    </div>
  )
}
