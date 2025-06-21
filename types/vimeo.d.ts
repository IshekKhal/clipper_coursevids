declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLElement | string, options?: any) => VimeoPlayer
    }
  }
}

interface VimeoPlayer {
  play(): Promise<void>
  pause(): Promise<void>
  setCurrentTime(seconds: number): Promise<number>
  getCurrentTime(): Promise<number>
  setVolume(volume: number): Promise<number>
  getVolume(): Promise<number>
  setPlaybackRate(rate: number): Promise<number>
  getDuration(): Promise<number>
  on(event: string, callback: (data?: any) => void): void
  off(event: string, callback?: (data?: any) => void): void
  destroy(): Promise<void>
}

export {}
