/**
 * Lip-Sync Manager
 * Detecta vogais no texto e mapeia para expressões VRM
 */

interface LipSyncEvent {
  vowel: 'aa' | 'ih' | 'ou' | 'neutral'
  intensity: number
  duration: number
}

export const VOWEL_MAP: Record<string, LipSyncEvent['vowel']> = {
  'a': 'aa',
  'á': 'aa',
  'ã': 'aa',
  'e': 'ih',
  'é': 'ih',
  'ê': 'ih',
  'i': 'ih',
  'í': 'ih',
  'o': 'ou',
  'ó': 'ou',
  'õ': 'ou',
  'u': 'ou',
  'ú': 'ou',
}

const SPEAKING_CHAR_DURATION = 60 // ms per character

/**
 * Gera eventos de lip-sync a partir de texto
 */
export function generateLipSyncFromText(text: string): LipSyncEvent[] {
  const events: LipSyncEvent[] = []
  let timeOffset = 0

  for (let i = 0; i < text.length; i++) {
    const char = text[i].toLowerCase()
    const vowel = VOWEL_MAP[char]

    if (vowel) {
      events.push({
        vowel,
        intensity: 1,
        duration: SPEAKING_CHAR_DURATION,
      })
      timeOffset += SPEAKING_CHAR_DURATION
    } else {
      // Consonant or non-letter - small pause
      if (events.length > 0 && events[events.length - 1].vowel !== 'neutral') {
        events.push({
          vowel: 'neutral',
          intensity: 0,
          duration: 20,
        })
      }
      timeOffset += 20
    }
  }

  // Add final neutral state
  events.push({
    vowel: 'neutral',
    intensity: 0,
    duration: 200,
  })

  return events
}

/**
 * Aplica lip-sync events ao VRM
 */
export async function applyLipSyncSequence(
  vrm: any,
  events: LipSyncEvent[],
  onComplete?: () => void
) {
  if (!vrm?.expressionManager) {
    console.warn('VRM expression manager not available')
    return
  }

  let currentTime = 0

  for (const event of events) {
    await new Promise((resolve) => {
      setTimeout(() => {
        if (event.vowel === 'neutral') {
          vrm.expressionManager.setValue('aa', 0)
          vrm.expressionManager.setValue('ih', 0)
          vrm.expressionManager.setValue('ou', 0)
        } else {
          // Reset all mouth shapes
          vrm.expressionManager.setValue('aa', 0)
          vrm.expressionManager.setValue('ih', 0)
          vrm.expressionManager.setValue('ou', 0)
          // Set the current vowel
          vrm.expressionManager.setValue(event.vowel, event.intensity)
        }
        resolve(null)
      }, event.duration)
    })

    currentTime += event.duration
  }

  onComplete?.()
}
