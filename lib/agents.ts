import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Agent {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  avatar: string
  language: string
  background_story: string | null
  personality_traits: Record<string, number> | null
  base_values: Record<string, any> | null
  thinking_style: string
  decision_making_approach: string
  debate_intensity: number
  micro_agents_count: number
  memories_count: number
  documents_count: number
  is_active: boolean
  last_interaction: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ChatResponse {
  conversation_id: string
  agent_id: string
  agent_name: string
  agent_response: string
  emotional_state?: Record<string, any>
  persona_state?: Record<string, any>
  relationship?: {
    trust_level?: number
    familiarity?: number
    affection?: number
    interaction_count?: number
    user_name?: string
  }
  confidence?: number
  duration_ms?: number
}

export interface GreetingResponse {
  should_greet: boolean
  greeting: string
  mood: string
  energy: number
  persona_state?: Record<string, any>
  relationship?: ChatResponse["relationship"]
  confidence?: number | null
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: `Erro ${res.status}` }))
    throw new Error(data.detail || `Erro ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function listAgents(options?: {
  activeOnly?: boolean
  allUsers?: boolean
}): Promise<Agent[]> {
  const params = new URLSearchParams()
  if (options?.activeOnly !== undefined) params.set("active_only", String(options.activeOnly))
  if (options?.allUsers) params.set("all_users", "true")
  const qs = params.toString()
  return apiFetch(`/agents${qs ? `?${qs}` : ""}`)
}

export async function getAgent(id: string): Promise<Agent> {
  return apiFetch(`/agents/${id}`)
}

export async function getAgentGreeting(agentId: string): Promise<GreetingResponse> {
  return apiFetch(`/personas/${agentId}/greeting`)
}

export interface CreatePersonaPayload {
  name: string
  description?: string
  avatar?: string
  language?: string
  background_story?: string
  persona?: Record<string, any>
  personality_traits?: Record<string, number>
  thinking_style?: string
  decision_making_approach?: string
  debate_intensity?: number
  micro_agent_types?: string[]
  initial_memories?: {
    title: string
    content: string
    type?: string
    importance_score?: number
    emotional_valence?: number
  }[]
}

export async function createPersona(payload: CreatePersonaPayload): Promise<{ status: string; human: { id: string } }> {
  return apiFetch("/personas", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getPersonaBlueprint(agentId: string): Promise<Record<string, any>> {
  return apiFetch(`/personas/${agentId}/blueprint`)
}

export async function updatePersonaBlueprint(agentId: string, section: string, data: Record<string, any>): Promise<any> {
  return apiFetch(`/personas/${agentId}/blueprint`, {
    method: "PUT",
    body: JSON.stringify({ section, data }),
  })
}

export async function updateAgent(id: string, updates: Partial<CreatePersonaPayload> & { is_active?: boolean }): Promise<Agent> {
  return apiFetch(`/agents/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function deleteAgent(id: string): Promise<void> {
  await apiFetch(`/agents/${id}`, { method: "DELETE" })
}

export async function chatWithAgent(
  agentId: string,
  message: string,
  conversationId?: string,
): Promise<ChatResponse> {
  return apiFetch(`/personas/${agentId}/chat`, {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  })
}

export async function getAgentMicroAgents(agentId: string) {
  return apiFetch(`/agents/${agentId}/micro-agents`)
}

export async function getAgentMemories(agentId: string) {
  return apiFetch(`/agents/${agentId}/memories`)
}

export async function deleteAgentMemories(agentId: string, memoryIds?: string[]): Promise<{ deleted: number }> {
  return apiFetch(`/agents/${agentId}/memories`, {
    method: "DELETE",
    body: JSON.stringify(memoryIds ? { memory_ids: memoryIds } : {}),
  })
}

export async function resetAgentConversation(agentId: string): Promise<{ sessions_cleared: number }> {
  return apiFetch(`/agents/${agentId}/conversations/reset`, { method: "POST" })
}

export async function getAgentDocuments(agentId: string) {
  return apiFetch(`/agents/${agentId}/documents`)
}

export async function uploadAgentDocument(agentId: string, file: File, description?: string) {
  const token = getToken()
  const form = new FormData()
  form.append("file", file)
  if (description) form.append("description", description)

  const res = await fetch(`${API_URL}/agents/${agentId}/documents/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: `Erro ${res.status}` }))
    throw new Error(data.detail || `Erro ${res.status}`)
  }
  return res.json()
}

// Helpers -------------------------------------------------------------------

export const AGENT_LANGUAGES: { value: string; label: string; flag: string }[] = [
  { value: "pt-PT", label: "Português", flag: "🇵🇹" },
  { value: "en-US", label: "English", flag: "🇺🇸" },
]

export const THINKING_STYLES: { value: string; label: string; description: string }[] = [
  { value: "balanced", label: "Equilibrado", description: "Combina lógica, emoção e criatividade de forma balanceada" },
  { value: "logical", label: "Lógico", description: "Prioriza análise crítica e pensamento estruturado" },
  { value: "emotional", label: "Emocional", description: "Prioriza empatia e inteligência emocional" },
  { value: "creative", label: "Criativo", description: "Prioriza inovação, imaginação e novas perspectivas" },
  { value: "analytical", label: "Analítico", description: "Divide problemas em partes e avalia cada uma" },
  { value: "intuitive", label: "Intuitivo", description: "Decide com base em padrões e instinto" },
]

export const DECISION_APPROACHES: { value: string; label: string; description: string }[] = [
  { value: "collaborative", label: "Colaborativo", description: "Micro-agentes debatem e chegam a consenso" },
  { value: "democratic", label: "Democrático", description: "Decisão por maioria ponderada" },
  { value: "autocratic", label: "Autocrático", description: "Um micro-agente dominante decide" },
  { value: "consensus", label: "Consenso", description: "Exige concordância de todos os micro-agentes" },
]

export const DEFAULT_PERSONALITY: Record<string, number> = {
  openness: 0.6,
  conscientiousness: 0.6,
  extraversion: 0.5,
  agreeableness: 0.7,
  neuroticism: 0.3,
}

export const PERSONALITY_LABELS: Record<string, { label: string; description: string }> = {
  openness: { label: "Abertura", description: "Curiosidade e abertura a novas experiências" },
  conscientiousness: { label: "Conscienciosidade", description: "Organização, disciplina e foco" },
  extraversion: { label: "Extroversão", description: "Sociabilidade e energia em interações" },
  agreeableness: { label: "Amabilidade", description: "Empatia e cooperação com outros" },
  neuroticism: { label: "Neuroticismo", description: "Sensibilidade ao stress e emoções negativas" },
}

export const MICRO_AGENT_TYPES = [
  { value: "logical", label: "Lógico", emoji: "🧠" },
  { value: "emotional", label: "Emocional", emoji: "💙" },
  { value: "critical", label: "Crítico", emoji: "🔍" },
  { value: "creative", label: "Criativo", emoji: "✨" },
  { value: "ethical", label: "Ético", emoji: "⚖️" },
  { value: "social", label: "Social", emoji: "🤝" },
]

export function agentArchetype(agent: Agent): { value: string; label: string; emoji: string; gradient: string; text: string } {
  const map: Record<string, { label: string; emoji: string; gradient: string; text: string }> = {
    logical: { label: "Lógico", emoji: "🧠", gradient: "from-blue-500/20 to-blue-600/10", text: "text-blue-300" },
    emotional: { label: "Emocional", emoji: "💙", gradient: "from-rose-500/20 to-rose-600/10", text: "text-rose-300" },
    creative: { label: "Criativo", emoji: "✨", gradient: "from-purple-500/20 to-purple-600/10", text: "text-purple-300" },
    analytical: { label: "Analítico", emoji: "📊", gradient: "from-cyan-500/20 to-cyan-600/10", text: "text-cyan-300" },
    intuitive: { label: "Intuitivo", emoji: "🌀", gradient: "from-fuchsia-500/20 to-fuchsia-600/10", text: "text-fuchsia-300" },
    balanced: { label: "Equilibrado", emoji: "⚖️", gradient: "from-emerald-500/20 to-emerald-600/10", text: "text-emerald-300" },
  }
  const key = agent.thinking_style in map ? agent.thinking_style : "balanced"
  return { value: key, ...map[key] }
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "agora mesmo"
  if (min < 60) return `há ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `há ${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `há ${day} dia${day > 1 ? "s" : ""}`
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
}
