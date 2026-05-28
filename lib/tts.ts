export type VoiceGender = "female" | "male"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

let audioContext: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let currentAnalyser: AnalyserNode | null = null
let playing = false
let speakGeneration = 0

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext()
  }
  if (audioContext.state === "suspended") {
    audioContext.resume()
  }
  return audioContext
}

export function getAnalyser(): AnalyserNode | null {
  return currentAnalyser
}

export function stopSpeaking() {
  speakGeneration += 1
  if (currentSource) {
    try { currentSource.stop() } catch {}
    currentSource = null
  }
  currentAnalyser = null
  playing = false
}

export function isSpeakingNow(): boolean {
  return playing
}

export interface SpeakOptions {
  gender: VoiceGender
  language?: string
  emotion?: string
  onStart?: () => void
  onEnd?: () => void
}

export async function speak(text: string, options: SpeakOptions): Promise<void> {
  stopSpeaking()
  const generation = speakGeneration

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  try {
    const res = await fetch(`${API_BASE}/tts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        gender: options.gender,
        language: options.language || "pt-PT",
        emotion: options.emotion || "neutral",
      }),
    })

    if (!res.ok) throw new Error(`TTS error ${res.status}`)

    const arrayBuffer = await res.arrayBuffer()
    const ctx = getAudioContext()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    if (generation !== speakGeneration) return

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.4

    source.connect(analyser)
    analyser.connect(ctx.destination)

    currentSource = source
    currentAnalyser = analyser
    playing = true

    return new Promise<void>((resolve) => {
      source.onended = () => {
        if (generation !== speakGeneration) {
          resolve()
          return
        }
        currentSource = null
        currentAnalyser = null
        playing = false
        options.onEnd?.()
        resolve()
      }

      source.start(0)
      options.onStart?.()
    })
  } catch {
    playing = false
    currentSource = null
    currentAnalyser = null
    options.onEnd?.()
  }
}

const VOICE_PREF_KEY = "percore-voice-gender"

export function getSavedVoiceGender(): VoiceGender {
  if (typeof window === "undefined") return "female"
  return (localStorage.getItem(VOICE_PREF_KEY) as VoiceGender) ?? "female"
}

export function saveVoiceGender(gender: VoiceGender) {
  if (typeof window === "undefined") return
  localStorage.setItem(VOICE_PREF_KEY, gender)
}
