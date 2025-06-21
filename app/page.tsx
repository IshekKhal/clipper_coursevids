"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { LoadingSpinner, LoadingDots } from "@/components/loading-spinner"

interface VideoPlayerProps {
  src: string
  title: string
}

function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([80])
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState("1")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState([0])
  const [isDragging, setIsDragging] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  // Extract video ID from Vimeo URL
  const getVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
    return match ? match[1] : null
  }

  const vimeoId = getVimeoId(src)

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    const timeout = setTimeout(() => {
      if (!isDragging) {
        setShowControls(false)
      }
    }, 3000)
    setControlsTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    if (!isDragging) {
      setShowControls(false)
    }
  }

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pause()
      } else {
        player.play()
      }
    }
  }

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.setVolume(volume[0] / 100)
        setIsMuted(false)
      } else {
        player.setVolume(0)
        setIsMuted(true)
      }
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (player) {
      if (newVolume[0] === 0) {
        player.setVolume(0)
        setIsMuted(true)
      } else {
        player.setVolume(newVolume[0] / 100)
        if (isMuted) {
          setIsMuted(false)
        }
      }
    }
  }

  const handleSpeedChange = (speed: string) => {
    setPlaybackRate(speed)
    if (player) {
      player.setPlaybackRate(Number.parseFloat(speed))
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  const handleProgressChange = (newProgress: number[]) => {
    if (player && duration > 0) {
      const newTime = (newProgress[0] / 100) * duration
      player.setCurrentTime(newTime)
      setCurrentTime(newTime)
      setProgress(newProgress)
    }
  }

  const handleProgressStart = () => {
    setIsDragging(true)
    setShowControls(true)
  }

  const handleProgressEnd = () => {
    setIsDragging(false)
  }

  const skipBackward = () => {
    if (player) {
      player.getCurrentTime().then((time: number) => {
        const newTime = Math.max(0, time - 10)
        player.setCurrentTime(newTime)
      })
    }
  }

  const skipForward = () => {
    if (player) {
      player.getCurrentTime().then((time: number) => {
        const newTime = Math.min(duration, time + 10)
        player.setCurrentTime(newTime)
      })
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Initialize Vimeo Player
  useEffect(() => {
    if (!vimeoId) return

    // Load Vimeo Player API
    const script = document.createElement("script")
    script.src = "https://player.vimeo.com/api/player.js"
    script.onload = () => {
      if (iframeRef.current && window.Vimeo) {
        const vimeoPlayer = new window.Vimeo.Player(iframeRef.current)
        setPlayer(vimeoPlayer)

        // Set up event listeners
        vimeoPlayer.on("play", () => {
          setIsPlaying(true)
        })

        vimeoPlayer.on("pause", () => {
          setIsPlaying(false)
        })

        vimeoPlayer.on("timeupdate", (data: any) => {
          if (!isDragging) {
            setCurrentTime(data.seconds)
            if (duration > 0) {
              setProgress([(data.seconds / duration) * 100])
            }
          }
        })

        vimeoPlayer.on("loaded", () => {
          setIsLoading(false)
          vimeoPlayer.getDuration().then((dur: number) => {
            setDuration(dur)
          })
          vimeoPlayer.getVolume().then((vol: number) => {
            setVolume([vol * 100])
          })
        })

        vimeoPlayer.on("volumechange", (data: any) => {
          setVolume([data.volume * 100])
          setIsMuted(data.volume === 0)
        })
      }
    }

    if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
      document.head.appendChild(script)
    } else if (window.Vimeo && iframeRef.current) {
      // Script already loaded
      const vimeoPlayer = new window.Vimeo.Player(iframeRef.current)
      setPlayer(vimeoPlayer)
      // Set up the same event listeners...
    }

    return () => {
      if (player) {
        player.destroy()
      }
    }
  }, [vimeoId])

  if (!vimeoId) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <p className="text-red-500">Invalid Vimeo URL</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl shadow-orange-500/20 border border-orange-500/30 group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20">
          <LoadingSpinner size="lg" text="Loading video..." />
        </div>
      )}

      {/* Vimeo Iframe - Hidden Controls */}
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?controls=0&autoplay=0&loop=0&byline=0&title=0&portrait=0&muted=0&background=0`}
        className="w-full aspect-video bg-black"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${
          showControls || isLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Play/Pause Button - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlay}
            className="bg-gradient-to-r from-[#FFD700]/20 to-[#FF6B35]/20 hover:from-[#FFD700]/40 hover:to-[#FF6B35]/40 text-[#FFD700] border-2 border-[#FFD700]/60 hover:border-[#FFD700] rounded-full w-20 h-20 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm shadow-lg shadow-[#FFD700]/30"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingDots />
            ) : isPlaying ? (
              <Pause className="h-14 w-14 text-[#FFD700] drop-shadow-lg" />
            ) : (
              <Play className="h-14 w-14 ml-1 text-[#FFD700] drop-shadow-lg" />
            )}
          </Button>
        </div>

        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-r from-black/95 to-black/90 backdrop-blur-md rounded-2xl p-4 border border-[#FFD700]/30 shadow-lg shadow-[#FFD700]/20">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#FFD700] text-sm font-medium min-w-[45px]">{formatTime(currentTime)}</span>
                <div className="flex-1">
                  <Slider
                    value={progress}
                    onValueChange={handleProgressChange}
                    onPointerDown={handleProgressStart}
                    onPointerUp={handleProgressEnd}
                    max={100}
                    step={0.1}
                    className="w-full cursor-pointer [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#FFD7কিন্ত00] [&_[role=slider]]:to-[#FF6B35] [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#FFD700] [&_[role=slider]]:shadow-md [&_[role=slider]]:shadow-[#FFD700]/40 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-[#FFD700] [&_.bg-primary]:to-[#FF6B35] [&_.bg-secondary]:bg-gray-600"
                    disabled={isLoading || duration === 0}
                  />
                </div>
                <span className="text-[#FFD700] text-sm font-medium min-w-[45px]">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                {/* Skip Backward */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipBackward}
                  className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                  disabled={isLoading}
                >
                  <SkipBack className="h-5 w-5 drop-shadow-sm" />
                </Button>

                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                  disabled={isLoading}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 drop-shadow-sm" />
                  ) : (
                    <Play className="h-6 w-6 drop-shadow-sm" />
                  )}
                </Button>

                {/* Skip Forward */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipForward}
                  className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                  disabled={isLoading}
                >
                  <SkipForward className="h-5 w-5 drop-shadow-sm" />
                </Button>

                {/* Volume Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                    disabled={isLoading}
                  >
                    {isMuted || volume[0] === 0 ? (
                      <VolumeX className="h-5 w-5 drop-shadow-sm" />
                    ) : (
                      <Volume2 className="h-5 w-5 drop-shadow-sm" />
                    )}
                  </Button>

                  <div className="w-24">
                    <Slider
                      value={volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#FFD700] [&_[role=slider]]:to-[#FF6B35] [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#FFD700] [&_[role=slider]]:shadow-md [&_[role=slider]]:shadow-[#FFD700]/40 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-[#FFD700] [&_.bg-primary]:to-[#FF6B35]"
                      disabled={isLoading}
                    />
                  </div>
                  <span className="text-[#FFD700] text-xs font-medium min-w-[30px]">{Math.round(volume[0])}%</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-4">
                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#FFD700]" />
                  <Select value={playbackRate} onValueChange={handleSpeedChange} disabled={isLoading}>
                    <SelectTrigger className="w-20 h-8 bg-gradient-to-r from-black/80 to-black/60 border-[#FFD700]/50 text-[#FFD700] text-sm hover:border-[#FFD700] transition-colors backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-to-b from-black to-gray-900 border-[#FFD700]/50 backdrop-blur-md">
                      <SelectItem value="0.25" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        0.25x
                      </SelectItem>
                      <SelectItem value="0.5" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        0.5x
                      </SelectItem>
                      <SelectItem value="0.75" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        0.75x
                      </SelectItem>
                      <SelectItem value="1" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        Normal
                      </SelectItem>
                      <SelectItem value="1.25" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        1.25x
                      </SelectItem>
                      <SelectItem value="1.5" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        1.5x
                      </SelectItem>
                      <SelectItem value="1.75" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        1.75x
                      </SelectItem>
                      <SelectItem value="2" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        2x
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                  disabled={isLoading}
                >
                  <Maximize className="h-5 w-5 drop-shadow-sm" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CourseLandingPage() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const videoListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const scrollToVideos = () => {
    videoListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const lessons = [
    {
      id: 1,
      title: "",
      description: "Get started with the fundamentals and course overview",
      videoUrl: "https://vimeo.com/1095192547",
    },
    {
      id: 2,
      title: "",
      description: "Learn the building blocks of web pages with HTML and CSS",
      videoUrl: "https://vimeo.com/1095192547", // Replace with actual Vimeo URL
    },
    {
      id: 3,
      title: "",
      description: "Master the programming language that powers the web",
      videoUrl: "https://vimeo.com/1095192547", // Replace with actual Vimeo URL
    },
    {
      id: 4,
      title: "",
      description: "Build dynamic user interfaces with React",
      videoUrl: "https://vimeo.com/1095192547", // Replace with actual Vimeo URL
    },
    {
      id: 5,
      title: "",
      description: "Put everything together in a comprehensive web application",
      videoUrl: "https://vimeo.com/1095192547", // Replace with actual Vimeo URL
    },
  ]

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading Course Content..." />
          <div className="mt-8">
            <LoadingDots />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/30 via-orange-900/20 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6B35] bg-clip-text text-transparent leading-tight mb-6 sm:mb-8">
              Welcome to ClipFarm Course Videos
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl bg-gradient-to-r from-[#FFFF00] to-[#FF8C00] bg-clip-text text-transparent max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
              Master Clipping with our comprehensive video course
            </p>
            <div className="flex justify-center">
              <Button
                onClick={scrollToVideos}
                size="lg"
                className="bg-gradient-to-r from-[#FFD700] to-[#FF6B35] hover:from-[#FFFF00] hover:to-[#FF8C00] text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 border-0"
              >
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Lessons Section */}
      <section
        ref={videoListRef}
        className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-transparent via-orange-900/10 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-orange-500/10 p-4 sm:p-6 lg:p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-orange-500/20 max-w-5xl mx-auto"
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6B35] bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                    Lesson {lesson.id}: {lesson.title}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg bg-gradient-to-r from-[#FFFF00] to-[#FF8C00] bg-clip-text text-transparent leading-relaxed">
                    {lesson.description}
                  </p>
                </div>

                <VideoPlayer src={lesson.videoUrl} title={lesson.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm sm:text-base bg-gradient-to-r from-[#FFFF00] to-[#FF8C00] bg-clip-text text-transparent">
              © 2024 Clipfarm Course Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
