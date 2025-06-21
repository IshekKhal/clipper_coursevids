"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVimeo, setIsVimeo] = useState(false)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if the URL is a Vimeo URL
    const vimeoPattern = /vimeo\.com|player\.vimeo\.com/
    setIsVimeo(vimeoPattern.test(src))
  }, [src])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    const timeout = setTimeout(() => {
      if (!isLoading) {
        setShowControls(false)
      }
    }, 3000)
    setControlsTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    if (!isLoading) {
      setShowControls(false)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // For Vimeo, we'll use postMessage API
    if (isVimeo && containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe")
      if (iframe) {
        const command = isPlaying ? "pause" : "play"
        iframe.contentWindow?.postMessage(`{"method":"${command}"}`, "*")
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (isVimeo && containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe")
      if (iframe) {
        const command = isMuted ? "setVolume" : "setVolume"
        const vol = isMuted ? volume[0] / 100 : 0
        iframe.contentWindow?.postMessage(`{"method":"${command}","value":${vol}}`, "*")
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (isVimeo && containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe")
      if (iframe) {
        iframe.contentWindow?.postMessage(`{"method":"setVolume","value":${newVolume[0] / 100}}`, "*")
      }
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume[0] / 100
    }
  }

  const handleProgressChange = (newProgress: number[]) => {
    const newTime = (newProgress[0] / 100) * duration
    setProgress(newProgress)
    setCurrentTime(newTime)

    if (isVimeo && containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe")
      if (iframe) {
        iframe.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleSpeedChange = (speed: string) => {
    setPlaybackRate(speed)
    if (isVimeo && containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe")
      if (iframe) {
        iframe.contentWindow?.postMessage(`{"method":"setPlaybackRate","value":${Number.parseFloat(speed)}}`, "*")
      }
    } else if (videoRef.current) {
      videoRef.current.playbackRate = Number.parseFloat(speed)
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

  const restartVideo = () => {
    if (isVimeo && containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe")
      if (iframe) {
        iframe.contentWindow?.postMessage('{"method":"setCurrentTime","value":0}', "*")
        iframe.contentWindow?.postMessage('{"method":"play"}', "*")
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
    setIsPlaying(true)
    setCurrentTime(0)
    setProgress([0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVideoPlay = () => setIsPlaying(true)
  const handleVideoPause = () => setIsPlaying(false)
  const handleVideoLoadStart = () => setIsLoading(true)
  const handleVideoCanPlay = () => setIsLoading(false)

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setDuration(total)
      setProgress([(current / total) * 100])
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  // Listen for Vimeo player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com") return

      try {
        const data = JSON.parse(event.data)

        switch (data.event) {
          case "ready":
            setIsLoading(false)
            // Request duration
            const iframe = containerRef.current?.querySelector("iframe")
            if (iframe) {
              iframe.contentWindow?.postMessage('{"method":"getDuration"}', "*")
            }
            break
          case "play":
            setIsPlaying(true)
            break
          case "pause":
            setIsPlaying(false)
            break
          case "ended":
            setIsPlaying(false)
            break
          case "timeupdate":
            if (data.data) {
              setCurrentTime(data.data.seconds)
              if (duration > 0) {
                setProgress([(data.data.seconds / duration) * 100])
              }
            }
            break
        }

        // Handle method responses
        if (data.method === "getDuration" && data.value) {
          setDuration(data.value)
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [duration])

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl shadow-orange-500/20 border border-orange-500/30 group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isVimeo ? (
        <>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20">
              <LoadingSpinner size="lg" text="Loading video..." />
            </div>
          )}

          {/* Vimeo Iframe - No Controls */}
          <iframe
            src={`${src}?background=1&autoplay=0&loop=0&byline=0&title=0&portrait=0&controls=0&muted=0&api=1`}
            className="w-full aspect-video bg-black"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            title={title}
          />
        </>
      ) : (
        <>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20">
              <LoadingSpinner size="lg" text="Loading video..." />
            </div>
          )}

          {/* HTML5 Video Player - No Controls */}
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoCanPlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            preload="metadata"
            muted={isMuted}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </>
      )}

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
          <div className="bg-gradient-to-r from-black/90 to-black/80 backdrop-blur-md rounded-2xl p-2 border border-[#FFD700]/30 shadow-lg shadow-[#FFD700]/20">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#FFD700] text-sm font-medium min-w-[45px]">{formatTime(currentTime)}</span>
                <div className="flex-1">
                  <Slider
                    value={progress}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={0.1}
                    className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#FFD700] [&_[role=slider]]:to-[#FF6B35] [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#FFD700] [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-[#FFD700]/50 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-[#FFD700] [&_.bg-primary]:to-[#FF6B35]"
                    disabled={isLoading}
                  />
                </div>
                <span className="text-[#FFD700] text-sm font-medium min-w-[45px]">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restartVideo}
                  className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                  disabled={isLoading}
                >
                  <RotateCcw className="h-5 w-5 drop-shadow-sm" />
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-[#FFD700] hover:bg-[#FFD700]/20 hover:text-[#FFFF00] transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-[#FFD700]/50"
                    disabled={isLoading}
                  >
                    {isMuted ? (
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
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#FFD700] text-sm font-medium">Speed:</span>
                  <Select value={playbackRate} onValueChange={handleSpeedChange} disabled={isLoading}>
                    <SelectTrigger className="w-20 h-8 bg-gradient-to-r from-black/80 to-black/60 border-[#FFD700]/50 text-[#FFD700] text-sm hover:border-[#FFD700] transition-colors backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-to-b from-black to-gray-900 border-[#FFD700]/50 backdrop-blur-md">
                      <SelectItem value="0.5" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        0.5x
                      </SelectItem>
                      <SelectItem value="0.75" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        0.75x
                      </SelectItem>
                      <SelectItem value="1" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        1x
                      </SelectItem>
                      <SelectItem value="1.25" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        1.25x
                      </SelectItem>
                      <SelectItem value="1.5" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        1.5x
                      </SelectItem>
                      <SelectItem value="2" className="text-[#FFD700] hover:bg-[#FFD700]/20 focus:bg-[#FFD700]/20">
                        2x
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
      title: "Module 1",
      description: "Get started with the fundamentals and course overview",
      videoUrl: "https://player.vimeo.com/video/1095192547",
    },
    {
      id: 2,
      title: "Module 2",
      description: "Learn the core concepts you'll need throughout the course",
      videoUrl: "https://player.vimeo.com/video/1095192547", // Using same video for demo
    },
    {
      id: 3,
      title: "Module 3",
      description: "Apply what you've learned with real-world examples",
      videoUrl: "https://player.vimeo.com/video/1095192547", // Using same video for demo
    },
    {
      id: 4,
      title: "Module 4",
      description: "Dive deeper into advanced methods and best practices",
      videoUrl: "https://player.vimeo.com/video/1095192547", // Using same video for demo
    },
    {
      id: 5,
      title: "Module 5",
      description: "Put everything together in a comprehensive final project",
      videoUrl: "https://player.vimeo.com/video/1095192547", // Using same video for demo
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
      <section className="border-b border-orange-500/30 relative">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6B35] bg-clip-text text-transparent leading-tight mb-6 sm:mb-8">
              Welcome to ClipFarm Course Videos
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl bg-gradient-to-r from-[#FFFF00] to-[#FF8C00] bg-clip-text text-transparent max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
              Scroll down to start watching your lessons
            </p>
            <div className="flex justify-center">
              <Button
                onClick={scrollToVideos}
                size="lg"
                className="bg-gradient-to-r from-[#FFD700] to-[#FF6B35] hover:from-[#FFFF00] hover:to-[#FF8C00] text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 border-0"
              >
                Start Watching
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Lessons Section */}
      <section ref={videoListRef} className="py-12 sm:py-16 lg:py-20">
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
      <footer className="border-t border-orange-500/30 py-6 sm:py-8 lg:py-12">
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
