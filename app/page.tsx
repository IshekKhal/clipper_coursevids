"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner, LoadingDots } from "@/components/loading-spinner"

interface VideoPlayerProps {
  src: string
  title: string
}

function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState("1")
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSpeedChange = (speed: string) => {
    setPlaybackRate(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = Number.parseFloat(speed)
    }
  }

  const handleVideoPlay = () => setIsPlaying(true)
  const handleVideoPause = () => setIsPlaying(false)
  const handleVideoLoadStart = () => setIsLoading(true)
  const handleVideoCanPlay = () => setIsLoading(false)

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-orange-500/20 overflow-hidden border border-orange-500/30">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black"
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onLoadStart={handleVideoLoadStart}
          onCanPlay={handleVideoCanPlay}
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading video..." />
          </div>
        )}

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-orange-500/30 hover:text-orange-200 transition-all duration-300 p-2 sm:p-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingDots />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-white text-xs sm:text-sm font-medium">Speed:</span>
              <Select value={playbackRate} onValueChange={handleSpeedChange} disabled={isLoading}>
                <SelectTrigger className="w-16 sm:w-20 h-7 sm:h-8 bg-black/60 border-orange-500/50 text-white text-xs sm:text-sm hover:border-orange-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-orange-500/50">
                  <SelectItem value="1" className="text-white hover:bg-orange-500/30">
                    1x
                  </SelectItem>
                  <SelectItem value="1.25" className="text-white hover:bg-orange-500/30">
                    1.25x
                  </SelectItem>
                  <SelectItem value="1.5" className="text-white hover:bg-orange-500/30">
                    1.5x
                  </SelectItem>
                  <SelectItem value="2" className="text-white hover:bg-orange-500/30">
                    2x
                  </SelectItem>
                </SelectContent>
              </Select>
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
    }, 2000)

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
      videoUrl: "https://example.com/video1.mp4",
    },
    {
      id: 2,
      title: "",
      description: "Learn the core concepts you'll need throughout the course",
      videoUrl: "https://example.com/video2.mp4",
    },
    {
      id: 3,
      title: "",
      description: "Apply what you've learned with real-world examples",
      videoUrl: "https://example.com/video3.mp4",
    },
    {
      id: 4,
      title: "",
      description: "Dive deeper into advanced methods and best practices",
      videoUrl: "https://example.com/video4.mp4",
    },
    {
      id: 5,
      title: "",
      description: "Put everything together in a comprehensive final project",
      videoUrl: "https://example.com/video5.mp4",
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
