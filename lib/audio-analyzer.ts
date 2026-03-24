/**
 * Audio Analyzer for Real-Time Lip-Sync
 * Detecta frequências de fala em tempo real
 */

export class AudioAnalyzer {
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array | null = null
  private animationId: number | null = null
  private onFrequency: ((frequency: 'aa' | 'ih' | 'ou' | 'neutral') => void) | null = null

  constructor(audioContext: AudioContext, source: AudioNode) {
    this.analyser = audioContext.createAnalyser()
    this.analyser.fftSize = 256
    source.connect(this.analyser)
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  /**
   * Inicia análise de áudio em tempo real
   */
  start(onFrequency: (frequency: 'aa' | 'ih' | 'ou' | 'neutral') => void) {
    this.onFrequency = onFrequency
    this.analyze()
  }

  /**
   * Para a análise de áudio
   */
  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * Detecta frequências de fala
   * 0-1kHz: vogais abertas (a, o)
   * 1-3kHz: vogais médias (e, i)
   * 3-4kHz: vogais fechadas (u)
   */
  private detectVowelFromFrequency(spectrum: Uint8Array): 'aa' | 'ih' | 'ou' | 'neutral' {
    const low = spectrum.slice(0, 10).reduce((a, b) => a + b, 0) / 10 // 0-1kHz
    const mid = spectrum.slice(10, 30).reduce((a, b) => a + b, 0) / 20 // 1-3kHz
    const high = spectrum.slice(30, 50).reduce((a, b) => a + b, 0) / 20 // 3-5kHz

    const average = (low + mid + high) / 3
    if (average < 30) return 'neutral' // Silence

    // Determine vowel based on dominant frequency
    if (low > mid && low > high) {
      return 'aa' // Open vowels (a, o)
    } else if (mid > low && mid > high) {
      return 'ih' // Mid vowels (e, i)
    } else if (high > low && high > mid) {
      return 'ou' // Closed vowels (u)
    }

    return 'neutral'
  }

  private analyze = () => {
    if (!this.analyser || !this.dataArray || !this.onFrequency) return

    this.analyser.getByteFrequencyData(this.dataArray)
    const vowel = this.detectVowelFromFrequency(this.dataArray)
    this.onFrequency(vowel)

    this.animationId = requestAnimationFrame(this.analyze)
  }
}
