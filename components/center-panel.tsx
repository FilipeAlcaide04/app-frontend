"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { ChevronDown, MessageCircle, UserRound } from "lucide-react";
import { VRMClientOnly } from "@/components/vrm-client-only";
import { useVRMLipSync } from "@/components/vrm-avatar";
import { Agent } from "@/lib/agents";

const DEFAULT_AVATAR_URL = "/avatars/placeholder.vrm";
const MAX_AVATAR_RETRIES = 2;
const AVATAR_PREF_KEY = "percore-selected-avatar";

interface AvatarOption {
  fileName: string;
  name: string;
  url: string;
  type: "vrm";
}

interface CenterPanelProps {
  agent: Agent | null;
  agents: Agent[];
  loading: boolean;
}

export function CenterPanel({ agent }: CenterPanelProps) {
  const [vrmAvatar, setVrmAvatar] = useState<string>(DEFAULT_AVATAR_URL);
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [avatarRetry, setAvatarRetry] = useState(0);
  const [vrm, setVrm] = useState<any>(null);
  const { speak: rawSpeak, stop: stopSpeaking } = useVRMLipSync(vrm);

  const handleBotMessage = (text: string, emotionalState?: Record<string, any>) => {
    const dominantEmotion =
      typeof emotionalState?.primary_emotion === "string"
        ? emotionalState.primary_emotion
        : typeof emotionalState?.dominant_emotion === "string"
          ? emotionalState.dominant_emotion
          : emotionalState
            ? Object.entries(emotionalState)
                .filter(([, value]) => typeof value === "number")
                .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0]
            : undefined;
    rawSpeak(text, {
      language: agent?.language || "pt-PT",
      emotion: dominantEmotion || "neutral",
    });
  };

  useEffect(() => {
    // Evita áudio residual quando troca de agente (pode causar mismatch com a nova saudação)
    stopSpeaking();
  }, [agent?.id]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadAvatar = async () => {
      try {
        const response = await fetch("/api/avatars/vrm", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Avatar API ${response.status}`);
        }

        const data = await response.json();

        const availableAvatars = Array.isArray(data?.avatars)
          ? data.avatars.filter(
              (item: AvatarOption) =>
                item &&
                typeof item.url === "string" &&
                typeof item.name === "string" &&
                item.type === "vrm"
            )
          : [];

        const savedAvatar =
          typeof window !== "undefined"
            ? window.localStorage.getItem(AVATAR_PREF_KEY)
            : null;

        const savedOption = availableAvatars.find(
          (avatar: AvatarOption) => avatar.url === savedAvatar
        );

        const apiAvatarUrl =
          data?.success &&
          typeof data.url === "string" &&
          data.url.trim().length > 0
            ? data.url
            : DEFAULT_AVATAR_URL;
        const resolvedUrl = savedOption?.url ?? apiAvatarUrl;

        if (!cancelled) {
          setAvatarOptions(availableAvatars);
          setVrmAvatar(resolvedUrl);
          setAvatarLoadFailed(false);
          setAvatarRetry(0);
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        console.warn("[CenterPanel] Failed to load avatar from API:", error);
        setVrmAvatar(DEFAULT_AVATAR_URL);
        setAvatarLoadFailed(false);
        setAvatarRetry(0);
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const avatarUrl =
    avatarRetry > 0
      ? `${vrmAvatar}${vrmAvatar.includes("?") ? "&" : "?"}retry=${avatarRetry}`
      : vrmAvatar;

  const selectedAvatar =
    avatarOptions.find((avatar) => avatar.url === vrmAvatar) ??
    avatarOptions.find((avatar) => avatar.url === DEFAULT_AVATAR_URL);

  const selectAvatar = (avatar: AvatarOption) => {
    setVrmAvatar(avatar.url);
    setAvatarLoadFailed(false);
    setAvatarRetry(0);
    setVrm(null);
    setShowAvatarMenu(false);
    window.localStorage.setItem(AVATAR_PREF_KEY, avatar.url);
  };

  return (
    <section className="flex-1 min-w-0 h-full flex relative min-h-0 overflow-hidden">
      {/* Avatar Section - Takes most of the space */}
      <div className="flex-1 min-w-0 h-full flex flex-col relative min-h-0">
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between">
          <div className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-lg border border-border/50">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <MessageCircle className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-foreground font-semibold">
              <span>{agent?.name || "🤖"}</span>
            </span>
          </div>

          {avatarOptions.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAvatarMenu((current) => !current)}
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg shadow-black/10 backdrop-blur transition-colors hover:bg-card"
                title="Escolher boneco"
              >
                <UserRound className="h-3.5 w-3.5 text-accent" />
                <span className="max-w-[120px] truncate">
                  {selectedAvatar?.name ?? "Boneco"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {showAvatarMenu && (
                <div className="absolute right-0 top-full z-[80] mt-2 min-w-[190px] rounded-lg border border-border bg-card p-2 shadow-xl animate-appear">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Escolher personagem
                  </p>
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.url}
                      type="button"
                      onClick={() => selectAvatar(avatar)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors ${
                        avatar.url === vrmAvatar
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-card/80"
                      }`}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      <span className="min-w-0 flex-1 truncate">{avatar.name}</span>
                      {avatar.url === vrmAvatar && <span className="text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex-1 min-h-0 mt-32">
          {!avatarLoadFailed ? (
            <VRMClientOnly
              key={avatarUrl}
              avatarUrl={avatarUrl}
              onAvatarLoaded={(loadedVrm) => {
                setVrm(loadedVrm);
                setAvatarLoadFailed(false);
                if (avatarRetry !== 0) {
                  setAvatarRetry(0);
                }
              }}
              onError={() => {
                setVrm(null);
                if (avatarRetry >= MAX_AVATAR_RETRIES) {
                  setAvatarLoadFailed(true);
                  return;
                }
                setAvatarRetry((current) => current + 1);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-card/60 border border-border/50 flex items-center justify-center text-4xl">
                {agent?.avatar || "🤖"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section - Right side */}
      <div className="w-full sm:w-[min(400px,42vw)] sm:min-w-[320px] shrink-0 h-full border-l border-border bg-card/30 flex flex-col">
        <ChatInterface agent={agent} onBotMessage={handleBotMessage} />
      </div>
    </section>
  );
}
