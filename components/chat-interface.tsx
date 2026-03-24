"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Volume2, Settings } from "lucide-react"

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Sou a tua Personal Core. Como posso ajudar-te hoje?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Interessante! Deixa-me processar isso através dos meus agentes cognitivos...",
        "O agente lógico está a analisar a tua questão enquanto o emocional avalia o contexto.",
        "A minha memória está a buscar referências relevantes para te ajudar melhor.",
        "O agente criativo sugere uma abordagem diferente. Queres explorar?",
      ]
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Voice recognition would be implemented here
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-gradient-to-r from-card/70 to-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-foreground">Chat em Tempo Real</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-card/50 transition-colors">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-card/50 transition-colors">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0 bg-gradient-to-b from-transparent via-background/50 to-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 animate-appear ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all ${
                message.isUser
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-gradient-to-br from-card to-card/60 text-foreground border border-border/50 shadow-lg shadow-card/10"
              }`}
            >
              <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
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

      {/* Input */}
      <div className="p-2.5 sm:p-4 border-t border-border bg-gradient-to-t from-card/70 via-card/40 to-transparent backdrop-blur-sm">
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Fala comigo..."
            className="h-9 sm:h-10 bg-input border-border/50 rounded-full px-3 sm:px-4 text-sm focus:border-primary/50 transition-all"
          />
          
          <Button
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0 transition-all hover:shadow-lg hover:shadow-primary/30"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
