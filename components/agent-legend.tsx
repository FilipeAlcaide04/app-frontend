"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

const agents = [
  {
    name: "Córtex Pré-frontal • Autocontrolo",
    description: "Planeamento, foco e decisões sob emoção",
    color: "#00d4ff",
  },
  {
    name: "Amígdala • Medo",
    description: "Alerta emocional e resposta a ameaças",
    color: "#ff3366",
  },
  {
    name: "Núcleo Accumbens • Prazer",
    description: "Recompensa, motivação e sensação de conquista",
    color: "#ffd400",
  },
  {
    name: "Hipocampo • Memória Afetiva",
    description: "Memórias ligadas a sentimentos e contexto",
    color: "#00ff88",
  },
  {
    name: "Córtex Insular • Empatia",
    description: "Sensações internas e leitura emocional social",
    color: "#ff8800",
  },
  {
    name: "Córtex Temporal • Vínculo Social",
    description: "Interpretação de voz, rosto e intenção",
    color: "#a855f7",
  },
  {
    name: "Lobo Occipital • Imaginação",
    description: "Visualização mental e criatividade",
    color: "#3b82f6",
  },
]

export function AgentLegend() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute bottom-4 right-4 z-10 max-w-xs">
      <Button
        variant="outline"
        size="sm"
        className="w-full mb-2 bg-card/80 backdrop-blur-sm border-border"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Brain className="h-4 w-4 mr-2" />
        <span>Emoções do Cérebro</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronUp className="h-4 w-4 ml-auto" />
        )}
      </Button>

      {isExpanded && (
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
          {agents.map((agent) => (
            <div key={agent.name} className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-lg"
                style={{
                  backgroundColor: agent.color,
                  boxShadow: `0 0 10px ${agent.color}60`,
                }}
              />
              <div>
                <p className="text-xs font-medium text-foreground">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {agent.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
