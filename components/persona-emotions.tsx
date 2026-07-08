"use client";

import React, { useEffect, useState } from "react";
import {
  Smile,
  Frown,
  Flame,
  AlertTriangle,
  Zap,
  TrendingDown,
  Heart,
  Clock,
  Layers,
  AlertCircle,
  Award,
  Eye,
  Gift,
  ThumbsDown,
  MessageCircle,
  Star,
} from "lucide-react";

interface PersonaEmotions {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  trust: number;
  anticipation: number;
  love: number;
  guilt: number;
  shame: number;
  pride: number;
  envy: number;
  gratitude: number;
  resentment: number;
  contempt: number;
  loneliness: number;
  hope: number;
  nostalgia: number;
  lastUpdated: string;
}

interface PersonaEmotionsProps {
  agentId?: string;
  className?: string;
}

const DEFAULT_EMOTIONS: PersonaEmotions = {
  joy: 0.7,
  sadness: 0.2,
  anger: 0.15,
  fear: 0.1,
  surprise: 0.25,
  disgust: 0.1,
  trust: 0.6,
  anticipation: 0.3,
  love: 0.4,
  guilt: 0.1,
  shame: 0.1,
  pride: 0.3,
  envy: 0.1,
  gratitude: 0.2,
  resentment: 0.1,
  contempt: 0.05,
  loneliness: 0.15,
  hope: 0.65,
  nostalgia: 0.1,
  lastUpdated: new Date().toISOString(),
};

const getStatusColor = (value: number) => {
  if (value >= 0.66) return "text-emerald-400";
  if (value >= 0.33) return "text-yellow-400";
  return "text-red-400";
};

const EMOTION_ICONS: {
  [key in keyof Omit<PersonaEmotions, "lastUpdated">]: {
    icon: React.ReactNode;
    label: string;
  };
} = {
  joy: { icon: <Smile className="w-5 h-5" />, label: "Alegria" },
  sadness: { icon: <Frown className="w-5 h-5" />, label: "Tristeza" },
  anger: { icon: <Flame className="w-5 h-5" />, label: "Raiva" },
  fear: { icon: <AlertTriangle className="w-5 h-5" />, label: "Medo" },
  surprise: { icon: <Zap className="w-5 h-5" />, label: "Surpresa" },
  disgust: { icon: <TrendingDown className="w-5 h-5" />, label: "Nojo" },
  trust: { icon: <Heart className="w-5 h-5" />, label: "Confiança" },
  anticipation: { icon: <Clock className="w-5 h-5" />, label: "Antecipação" },
  love: { icon: <Gift className="w-5 h-5" />, label: "Amor" },
  guilt: { icon: <AlertCircle className="w-5 h-5" />, label: "Culpa" },
  shame: { icon: <Eye className="w-5 h-5" />, label: "Vergonha" },
  pride: { icon: <Award className="w-5 h-5" />, label: "Orgulho" },
  envy: { icon: <Layers className="w-5 h-5" />, label: "Inveja" },
  gratitude: { icon: <ThumbsDown className="w-5 h-5" />, label: "Gratidão" },
  resentment: { icon: <AlertCircle className="w-5 h-5" />, label: "Ressentimento" },
  contempt: { icon: <MessageCircle className="w-5 h-5" />, label: "Desprezo" },
  loneliness: { icon: <Heart className="w-5 h-5" />, label: "Solidão" },
  hope: { icon: <Star className="w-5 h-5" />, label: "Esperança" },
  nostalgia: { icon: <Clock className="w-5 h-5" />, label: "Nostalgia" },
};

const EmotionIcon = ({
  emotion,
  value,
  label,
}: {
  emotion: string;
  value: number;
  label: string;
}) => {
  const color = getStatusColor(value);
  const percentage = Math.round(value * 100);
  const icon = EMOTION_ICONS[emotion as keyof typeof EMOTION_ICONS];

  if (!icon) return null;

  return (
    <div className="group relative">
      <div className={`flex items-center justify-center h-6 w-6 ${color} transition-all`}>
        {icon.icon}
      </div>

      {/* Tooltip ao passar o mouse */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
        </div>
      </div>
    </div>
  );
};

export function PersonaEmotions({
  agentId,
  className = "",
}: PersonaEmotionsProps) {
  const [emotions, setEmotions] = useState<PersonaEmotions>(DEFAULT_EMOTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        setLoading(true);

        // TODO: Substituir por API real quando disponível
        if (agentId) {
          // const response = await fetch(`/api/agents/${agentId}/emotions`);
          // const data = await response.json();
          // setEmotions(data);
        }

        // Por enquanto, usar dados default com valores simulados
        setTimeout(() => {
          setEmotions({
            joy: 0.7 + Math.random() * 0.2,
            sadness: 0.2 + Math.random() * 0.2,
            anger: 0.15 + Math.random() * 0.2,
            fear: 0.1 + Math.random() * 0.15,
            surprise: 0.25 + Math.random() * 0.2,
            disgust: 0.1 + Math.random() * 0.15,
            trust: 0.6 + Math.random() * 0.3,
            anticipation: 0.3 + Math.random() * 0.2,
            love: 0.4 + Math.random() * 0.3,
            guilt: 0.1 + Math.random() * 0.1,
            shame: 0.1 + Math.random() * 0.1,
            pride: 0.3 + Math.random() * 0.2,
            envy: 0.1 + Math.random() * 0.15,
            gratitude: 0.2 + Math.random() * 0.2,
            resentment: 0.1 + Math.random() * 0.15,
            contempt: 0.05 + Math.random() * 0.1,
            loneliness: 0.15 + Math.random() * 0.15,
            hope: 0.65 + Math.random() * 0.3,
            nostalgia: 0.1 + Math.random() * 0.15,
            lastUpdated: new Date().toISOString(),
          });
          setLoading(false);
        }, 300);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchEmotions();
  }, [agentId]);

  if (loading) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {[...Array(19)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <EmotionIcon emotion="joy" value={emotions.joy} label="Alegria" />
      <EmotionIcon emotion="sadness" value={emotions.sadness} label="Tristeza" />
      <EmotionIcon emotion="anger" value={emotions.anger} label="Raiva" />
      <EmotionIcon emotion="fear" value={emotions.fear} label="Medo" />
      <EmotionIcon emotion="surprise" value={emotions.surprise} label="Surpresa" />
      <EmotionIcon emotion="disgust" value={emotions.disgust} label="Nojo" />
      <EmotionIcon emotion="trust" value={emotions.trust} label="Confiança" />
      <EmotionIcon emotion="anticipation" value={emotions.anticipation} label="Antecipação" />
      <EmotionIcon emotion="love" value={emotions.love} label="Amor" />
      <EmotionIcon emotion="guilt" value={emotions.guilt} label="Culpa" />
      <EmotionIcon emotion="shame" value={emotions.shame} label="Vergonha" />
      <EmotionIcon emotion="pride" value={emotions.pride} label="Orgulho" />
      <EmotionIcon emotion="envy" value={emotions.envy} label="Inveja" />
      <EmotionIcon emotion="gratitude" value={emotions.gratitude} label="Gratidão" />
      <EmotionIcon emotion="resentment" value={emotions.resentment} label="Ressentimento" />
      <EmotionIcon emotion="contempt" value={emotions.contempt} label="Desprezo" />
      <EmotionIcon emotion="loneliness" value={emotions.loneliness} label="Solidão" />
      <EmotionIcon emotion="hope" value={emotions.hope} label="Esperança" />
      <EmotionIcon emotion="nostalgia" value={emotions.nostalgia} label="Nostalgia" />
    </div>
  );
}
