"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Zap,
  Heart,
  Brain,
  Activity,
  TrendingDown,
  Smile,
  Frown,
  Flame,
  Wind,
  AlertTriangle,
  Gift,
  Layers,
  Angry,
  MessageSquare,
} from "lucide-react";

interface PersonaMetrics {
  energyLevel: number; // 0.0 (exausto) a 1.0 (pleno)
  stressLevel: number; // 0.0 (calmo) a 1.0 (crítico)
  emotionalStability: number; // 0.0 a 1.0
  confidence: number; // 0.0 a 1.0
  focusLevel: number; // 0.0 a 1.0
  mood: number; // 0.0 (triste) a 1.0 (feliz)
  // Emoções do Backend (10 total)
  joy: number; // Alegria
  sadness: number; // Tristeza
  anger: number; // Raiva
  fear: number; // Medo
  surprise: number; // Surpresa
  trust: number; // Confiança
  love: number; // Amor
  loneliness: number; // Solidão
  resentment: number; // Ressentimento
  hope: number; // Esperança
  lastUpdated: string;
}

interface PersonaStatusProps {
  agentId?: string;
  className?: string;
  showDetails?: boolean;
}

const DEFAULT_METRICS: PersonaMetrics = {
  energyLevel: 0.7,
  stressLevel: 0.3,
  emotionalStability: 0.75,
  confidence: 0.8,
  focusLevel: 0.7,
  mood: 0.65,
  joy: 0.7,
  sadness: 0.2,
  anger: 0.15,
  fear: 0.1,
  surprise: 0.25,
  trust: 0.6,
  love: 0.4,
  loneliness: 0.15,
  resentment: 0.1,
  hope: 0.65,
  lastUpdated: new Date().toISOString(),
};

const getStatusColor = (value: number, inverted: boolean = false) => {
  const threshold = inverted
    ? [0.33, 0.66] // Para stress: vermelho em cima, verde em baixo
    : [0.33, 0.66]; // Para energia: verde em cima, vermelho em baixo

  if (inverted) {
    // Stress: quanto MENOS stress, melhor
    if (value < threshold[0]) return "text-emerald-400"; // Baixo stress = verde
    if (value < threshold[1]) return "text-yellow-400"; // Médio stress = amarelo
    return "text-red-400"; // Alto stress = vermelho
  } else {
    // Energia: quanto MAIS energia, melhor
    if (value >= threshold[1]) return "text-emerald-400"; // Alta = verde
    if (value >= threshold[0]) return "text-yellow-400"; // Média = amarelo
    return "text-red-400"; // Baixa = vermelho
  }
};

const StatusIcon = ({
  icon: Icon,
  label,
  value,
  inverted = false,
  tooltip = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  inverted?: boolean;
  tooltip?: string;
}) => {
  const color = getStatusColor(value, inverted);
  const percentage = Math.round(value * 100);

  return (
    <div
      className={`group relative flex items-center gap-2 cursor-help py-1`}
      title={tooltip}
    >
      <div className={`flex items-center justify-center h-6 w-6 ${color}`}>
        {Icon}
      </div>
      <span className="text-xs text-muted-foreground min-w-[80px]">{label}</span>
      <span className="text-xs font-mono text-foreground ml-auto">{percentage}%</span>

      {/* Tooltip ao passar o mouse */}
      <div className="absolute left-full ml-2 hidden group-hover:block z-50">
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
          {tooltip && (
            <p className="text-xs text-accent mt-1 max-w-xs">{tooltip}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export function PersonaStatus({
  agentId,
  className = "",
  showDetails = false,
}: PersonaStatusProps) {
  const [metrics, setMetrics] = useState<PersonaMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Substituir por API real quando disponível
        if (agentId) {
          // const response = await fetch(`/api/agents/${agentId}/metrics`);
          // const data = await response.json();
          // setMetrics(data);
        }

        // Por enquanto, usar dados default com valores simulados
        setTimeout(() => {
          setMetrics({
            energyLevel: 0.7 + Math.random() * 0.2,
            stressLevel: 0.3 + Math.random() * 0.3,
            emotionalStability: 0.75 + Math.random() * 0.2,
            confidence: 0.8 + Math.random() * 0.15,
            focusLevel: 0.7 + Math.random() * 0.25,
            mood: 0.65 + Math.random() * 0.3,
            joy: 0.7 + Math.random() * 0.25,
            sadness: 0.2 + Math.random() * 0.2,
            anger: 0.15 + Math.random() * 0.2,
            fear: 0.1 + Math.random() * 0.15,
            surprise: 0.25 + Math.random() * 0.2,
            trust: 0.6 + Math.random() * 0.3,
            love: 0.4 + Math.random() * 0.3,
            loneliness: 0.15 + Math.random() * 0.15,
            resentment: 0.1 + Math.random() * 0.15,
            hope: 0.65 + Math.random() * 0.3,
            lastUpdated: new Date().toISOString(),
          });
          setLoading(false);
        }, 300);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar métricas");
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [agentId]);

  if (loading) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted/50 animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted/50 animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted/50 animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  const tooltips = {
    energy: "Nível de energia do boneco",
    stress: "Quanto menor, melhor",
    stability: "Estabilidade emocional",
    confidence: "Confiança nas respostas",
    focus: "Nível de concentração",
    mood: "Humor geral",
    joy: "Sentimento de alegria",
    sadness: "Sentimento de tristeza",
    anger: "Sentimento de raiva",
    fear: "Sentimento de medo",
    surprise: "Sentimento de surpresa",
    trust: "Confiança em geral",
    love: "Sentimento de amor",
    loneliness: "Sentimento de solidão",
    resentment: "Sentimento de ressentimento",
    hope: "Sentimento de esperança",
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Métricas Base - AO COMPRIDO */}
      <div className="pb-2 border-b border-border/20">
        <p className="text-xs font-semibold text-foreground/60 mb-2 uppercase">Estado Base</p>
        <div className="flex flex-col gap-1">
          <StatusIcon
            icon={<Zap className="w-4 h-4" />}
            label="Energia"
            value={metrics.energyLevel}
            tooltip={tooltips.energy}
          />
          <StatusIcon
            icon={<AlertCircle className="w-4 h-4" />}
            label="Stress"
            value={metrics.stressLevel}
            inverted={true}
            tooltip={tooltips.stress}
          />
          <StatusIcon
            icon={<Heart className="w-4 h-4" />}
            label="Estabilidade"
            value={metrics.emotionalStability}
            tooltip={tooltips.stability}
          />
          <StatusIcon
            icon={<Brain className="w-4 h-4" />}
            label="Confiança"
            value={metrics.confidence}
            tooltip={tooltips.confidence}
          />
          <StatusIcon
            icon={<Activity className="w-4 h-4" />}
            label="Foco"
            value={metrics.focusLevel}
            tooltip={tooltips.focus}
          />
          <StatusIcon
            icon={<Smile className="w-4 h-4" />}
            label="Humor"
            value={metrics.mood}
            tooltip={tooltips.mood}
          />
        </div>
      </div>

      {/* Emoções - AO COMPRIDO */}
      <div>
        <p className="text-xs font-semibold text-foreground/60 mb-2 uppercase">Emoções</p>
        <div className="flex flex-col gap-1">
          <StatusIcon
            icon={<Smile className="w-4 h-4" />}
            label="Alegria"
            value={metrics.joy}
            tooltip={tooltips.joy}
          />
          <StatusIcon
            icon={<Frown className="w-4 h-4" />}
            label="Tristeza"
            value={metrics.sadness}
            tooltip={tooltips.sadness}
          />
          <StatusIcon
            icon={<Flame className="w-4 h-4" />}
            label="Raiva"
            value={metrics.anger}
            tooltip={tooltips.anger}
          />
          <StatusIcon
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Medo"
            value={metrics.fear}
            tooltip={tooltips.fear}
          />
          <StatusIcon
            icon={<Wind className="w-4 h-4" />}
            label="Surpresa"
            value={metrics.surprise}
            tooltip={tooltips.surprise}
          />
          <StatusIcon
            icon={<Heart className="w-4 h-4" />}
            label="Confiança"
            value={metrics.trust}
            tooltip={tooltips.trust}
          />
          <StatusIcon
            icon={<Gift className="w-4 h-4" />}
            label="Amor"
            value={metrics.love}
            tooltip={tooltips.love}
          />
          <StatusIcon
            icon={<MessageSquare className="w-4 h-4" />}
            label="Solidão"
            value={metrics.loneliness}
            tooltip={tooltips.loneliness}
          />
          <StatusIcon
            icon={<Angry className="w-4 h-4" />}
            label="Ressentimento"
            value={metrics.resentment}
            tooltip={tooltips.resentment}
          />
          <StatusIcon
            icon={<TrendingDown className="w-4 h-4" />}
            label="Esperança"
            value={metrics.hope}
            tooltip={tooltips.hope}
          />
        </div>
      </div>

      {/* Detalhes expandidos (opcional) */}
      {showDetails && (
        <div className="space-y-2 p-3 rounded-lg bg-card/40 border border-border/30 mt-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Métricas Detalhadas
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Energia:</span>
              <span className="font-mono">{(metrics.energyLevel * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Stress:</span>
              <span className="font-mono">{(metrics.stressLevel * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Alegria:</span>
              <span className="font-mono">{(metrics.joy * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Tristeza:</span>
              <span className="font-mono">{(metrics.sadness * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Raiva:</span>
              <span className="font-mono">{(metrics.anger * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Medo:</span>
              <span className="font-mono">{(metrics.fear * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Esperança:</span>
              <span className="font-mono">{(metrics.hope * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/20">
            <span className="text-xs text-muted-foreground">
              Atualizado:{" "}
              {new Date(metrics.lastUpdated).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
          <p className="text-xs text-red-300">Erro: {error}</p>
        </div>
      )}
    </div>
  );
}
