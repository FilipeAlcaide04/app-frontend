const ACTION_RE = /\*[^*]+\*|\([^)]*(?:sigh|laugh|smile|nod|shake|wave|shrug|gasp|groan|cry|sob|whisper|clear|cough|snap|roll|lean|cross|clench|tap|drum|bite|rub|scratch|fidget|wink|grin|frown|pout|squint|glare|stare|blink)[^)]*\)/gi

export function cleanForDisplay(text: string): string {
  return text.replace(ACTION_RE, "").replace(/\s{2,}/g, " ").trim()
}

export function cleanForTTS(text: string): string {
  return cleanForDisplay(text)
}
