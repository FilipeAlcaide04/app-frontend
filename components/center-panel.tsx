"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChatInterface } from "@/components/chat-interface";
import { PersonaEmotions } from "@/components/persona-emotions";
import { MessageCircle, Plus } from "lucide-react";
import { VRMClientOnly } from "@/components/vrm-client-only";
import { useVRMLipSync } from "@/components/vrm-avatar";
import { Agent } from "@/lib/agents";

const DEFAULT_AVATAR_URL = "/avatars/placeholder.vrm";
const MAX_AVATAR_RETRIES = 2;

interface CenterPanelProps {
  agent: Agent | null;
  agents: Agent[];
  loading: boolean;
}

export function CenterPanel({ agent, agents, loading }: CenterPanelProps) {
  const router = useRouter();
  const [vrmAvatar, setVrmAvatar] = useState<string>(DEFAULT_AVATAR_URL);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [avatarRetry, setAvatarRetry] = useState(0);
  const [vrm, setVrm] = useState<any>(null);
  const { speak } = useVRMLipSync(vrm);

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

        const resolvedUrl =
          data?.success &&
          typeof data.url === "string" &&
          data.url.trim().length > 0
            ? data.url
            : DEFAULT_AVATAR_URL;

        if (!cancelled) {
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

  return (
    <section className="flex-1 h-full flex relative min-h-0">
      {/* Avatar Section - Takes most of the space */}
      <div className="flex-1 h-full flex flex-col relative min-h-0">
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between">
          <div className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-lg border border-border/50">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <MessageCircle className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-foreground font-semibold">
              <span>{agent?.name || "🤖"}</span>
            </span>
          </div>

          {/* Persona Emotions - Vertical on the right */}
          <PersonaEmotions agentId={agent?.id} className="pr-2" />
        </div>

        {/* Avatar */}
        <div className="flex-1 min-h-0 mt-32">
          {!avatarLoadFailed ? (
            <VRMClientOnly
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
      <div className="w-[clamp(280px,30%,400px)] h-full border-l border-border bg-card/30 flex flex-col">
        <ChatInterface agent={agent} onBotMessage={speak} />
      </div>
    </section>
  );
}
