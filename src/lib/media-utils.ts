/**
 * Media utilities for handling audio and video in the language learning app
 */

export interface AudioConfig {
  autoplay?: boolean
  loop?: boolean
  volume?: number // 0.0 to 1.0
  playbackRate?: number // 0.25 to 2.0 for slow/fast playback
}

export interface VideoConfig extends AudioConfig {
  muted?: boolean
  controls?: boolean
  poster?: string
}

/**
 * Create and configure an audio element
 */
export function createAudioElement(src: string, config: AudioConfig = {}): HTMLAudioElement {
  const audio = new Audio(src)
  
  // Apply configuration
  if (config.autoplay !== undefined) audio.autoplay = config.autoplay
  if (config.loop !== undefined) audio.loop = config.loop
  if (config.volume !== undefined) audio.volume = Math.max(0, Math.min(1, config.volume))
  if (config.playbackRate !== undefined) {
    audio.playbackRate = Math.max(0.25, Math.min(2.0, config.playbackRate))
  }
  
  // Add error handling
  audio.addEventListener('error', (e) => {
    console.error('Audio error:', e)
  })
  
  return audio
}

/**
 * Play audio with promise-based API
 */
export async function playAudio(audio: HTMLAudioElement): Promise<void> {
  try {
    await audio.play()
  } catch (error) {
    console.error('Failed to play audio:', error)
    throw error
  }
}

/**
 * Stop audio and reset to beginning
 */
export function stopAudio(audio: HTMLAudioElement): void {
  audio.pause()
  audio.currentTime = 0
}

/**
 * Set audio playback rate (for slow/fast playback)
 */
export function setPlaybackRate(audio: HTMLAudioElement, rate: number): void {
  audio.playbackRate = Math.max(0.25, Math.min(2.0, rate))
}

/**
 * Get audio duration in seconds
 */
export function getAudioDuration(audio: HTMLAudioElement): number {
  return audio.duration || 0
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying(audio: HTMLAudioElement): boolean {
  return !audio.paused && !audio.ended && audio.currentTime > 0
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Audio recorder utility for pronunciation exercises
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}

/**
 * Convert blob to data URL for playback
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Download audio blob as file
 */
export function downloadAudio(blob: Blob, filename: string = 'recording.webm'): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Check if browser supports audio recording
 */
export function supportsAudioRecording(): boolean {
  return !!(typeof navigator !== 'undefined' && 
           navigator.mediaDevices && 
           typeof navigator.mediaDevices.getUserMedia === 'function' && 
           typeof window !== 'undefined' && 
           typeof window.MediaRecorder !== 'undefined')
}

/**
 * Check if browser supports audio playback
 */
export function supportsAudioPlayback(): boolean {
  return typeof Audio !== 'undefined'
}

/**
 * Get supported audio formats
 */
export function getSupportedAudioFormats(): string[] {
  const audio = new Audio()
  const formats = [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/mp4'
  ]
  
  return formats.filter(format => audio.canPlayType(format) !== '')
}

/**
 * Preload audio for better performance
 */
export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(src)
    
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true })
    audio.addEventListener('error', reject, { once: true })
    
    audio.load()
  })
}

/**
 * Audio visualization utility (simple volume meter)
 */
export class AudioVisualizer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array | null = null

  async initialize(stream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext()
      this.analyser = this.audioContext.createAnalyser()
      
      const source = this.audioContext.createMediaStreamSource(stream)
      source.connect(this.analyser)
      
      this.analyser.fftSize = 256
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    } catch (error) {
      console.error('Failed to initialize audio visualizer:', error)
      throw error
    }
  }

  getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0
    
    // Create a new Uint8Array to avoid type issues
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(frequencyData)
    
    let sum = 0
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i]
    }
    
    return sum / frequencyData.length / 255 // Normalize to 0-1
  }

  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.analyser = null
    this.dataArray = null
  }
}
