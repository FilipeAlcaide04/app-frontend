"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, X, Plus, Sparkles } from "lucide-react"
import Link from "next/link"

const agentTypes = [
  {
    id: "logic",
    name: "Lógico",
    description: "Especializado em análise crítica e resolução de problemas",
    emoji: "🧠",
  },
  {
    id: "emotional",
    name: "Emocional",
    description: "Oferece suporte emocional e validação com empatia",
    emoji: "💙",
  },
  {
    id: "creative",
    name: "Criativo",
    description: "Cria conteúdo original e soluções inovadoras",
    emoji: "✨",
  },
  {
    id: "memory",
    name: "Memória",
    description: "Gerencia informações e aprende do histórico",
    emoji: "📚",
  },
]

export default function CreateAgentPage() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState("")
  const [agentName, setAgentName] = useState("")
  const [agentDescription, setAgentDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([])

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      setKnowledgeFiles([...knowledgeFiles, ...Array.from(files)])
    }
  }

  const handleRemoveFile = (index: number) => {
    setKnowledgeFiles(knowledgeFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      {/* Header */}
      <div className="border-b border-border/30 glass-subtle backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/agents">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Agente</h1>
              <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-subtle backdrop-blur-xl border-b border-border/30 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step
                    ? "bg-gradient-to-r from-primary to-accent"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 1: Select Type */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Qual tipo de agente queres criar?</h2>
              <p className="text-muted-foreground">Escolhe o tipo que melhor se adequa aos teus objetivos</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`glass-subtle rounded-2xl p-6 border-2 transition-all text-left ${
                    selectedType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="text-4xl mb-3">{type.emoji}</div>
                  <h3 className="text-lg font-semibold mb-1">{type.name}</h3>
                  <p className="text-sm text-muted-foreground/80">{type.description}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedType}
                className="gap-2"
              >
                Próximo
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Informações Básicas</h2>
              <p className="text-muted-foreground">Dá um nome e descrição ao teu agente</p>
            </div>

            <div className="glass-subtle rounded-2xl p-8 border border-white/5 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Agente</label>
                <Input
                  placeholder="Ex: Analisador de Código"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  placeholder="Descreve o propósito e capacidades do teu agente"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-subtle border border-white/10 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Anterior
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!agentName}
                className="gap-2"
              >
                Próximo
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: System Prompt */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">System Prompt</h2>
              <p className="text-muted-foreground">Define como o agente deve comportar-se e interagir</p>
            </div>

            <div className="glass-subtle rounded-2xl p-8 border border-white/5 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Instruções do Sistema</label>
                <textarea
                  placeholder="Descreve o papel, responsabilidades e diretrizes do agente..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-subtle border border-white/10 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={8}
                />
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  💡 Dica: Sé específico e claro nas instruções para melhores resultados. Inclui exemplos se necessário.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Anterior
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="gap-2"
              >
                Próximo
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Knowledge Base */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Base de Conhecimento</h2>
              <p className="text-muted-foreground">Carrega documentos para treinar o teu agente (opcional)</p>
            </div>

            <div className="glass-subtle rounded-2xl p-8 border border-white/5 space-y-6">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/30 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-medium mb-1">Arrasta ficheiros aqui ou clica para selecionar</p>
                <p className="text-sm text-muted-foreground/70">Suportados: PDF, TXT, DOCX, MD</p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleAddFile}
                  className="hidden"
                  accept=".pdf,.txt,.docx,.md"
                />
              </div>

              {/* Files List */}
              {knowledgeFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{knowledgeFiles.length} ficheiro(s) carregado(s)</p>
                  <div className="space-y-2">
                    {knowledgeFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                      >
                        <span className="text-sm">{file.name}</span>
                        <button
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-300">
                  ℹ️ A base de conhecimento ajudará o agente a fornecer respostas mais precisas e contextualizadas.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Anterior
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent">
                <Sparkles className="w-4 h-4" />
                Criar Agente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
