"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Volume2, Settings, Bot, Plus } from "lucide-react"
import { Agent, chatWithAgent } from "@/lib/agents"

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatInterfaceProps {
  agent: Agent | null
  onBotMessage?: (text: string) => void
}

export function ChatInterface({ agent, onBotMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset ao trocar de agente
  useEffect(() => {
    setConversationId(undefined)
    setError(null)
    setMessages(
      agent
        ? [
            {
              id: Date.now(),
              text: `Olá! Sou ${agent.name}. ${agent.description || "Como te posso ajudar hoje?"}`,
              isUser: false,
              timestamp: new Date(),
            },
          ]
        : [],
    )
  }, [agent?.id])

  // Auto-scroll ao receber mensagens novas
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

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
      const botText = resp.agent_response || "(sem resposta)"
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: botText, isUser: false, timestamp: new Date() },
      ])
      onBotMessage?.(botText)
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar mensagem")
    } finally {
      setIsTyping(false)
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
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
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/30 ">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{agent.avatar || "🤖"}</span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{agent.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {conversationId ? `conversa #${conversationId.slice(0, 8)}` : "nova conversa"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-card/50 transition-colors">
            <Volume2 className="h-4 w-4" />
          </Button>
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
                {message.timestamp.toLocaleTimeString("pt-PT", {
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
          <Button
            variant={isListening ? "default" : "outline"}
            size="icon"
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0 transition-all ${
              isListening ? "bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/50" : "hover:bg-card/70"
            }`}
            onClick={toggleListening}
          >
            <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
          </Button>

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
    </div>
  )
}
