"use client"

import { useState, useRef } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VideoPlayerProps {
  src: string
  title: string
}

function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState("1")
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-gray-900"
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Speed:</span>
              <Select value={playbackRate} onValueChange={handleSpeedChange}>
                <SelectTrigger className="w-20 h-8 bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
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
  const videoListRef = useRef<HTMLDivElement>(null)

  const scrollToVideos = () => {
    videoListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const lessons = [
    {
      id: 1,
      title: "Introduction to the Course",
      description: "Get started with the fundamentals and course overview",
      videoUrl: "https://example.com/video1.mp4",
    },
    {
      id: 2,
      title: "Basic Concepts",
      description: "Learn the core concepts you'll need throughout the course",
      videoUrl: "https://example.com/video2.mp4",
    },
    {
      id: 3,
      title: "Practical Applications",
      description: "Apply what you've learned with real-world examples",
      videoUrl: "https://example.com/video3.mp4",
    },
    {
      id: 4,
      title: "Advanced Techniques",
      description: "Dive deeper into advanced methods and best practices",
      videoUrl: "https://example.com/video4.mp4",
    },
    {
      id: 5,
      title: "Final Project",
      description: "Put everything together in a comprehensive final project",
      videoUrl: "https://example.com/video5.mp4",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">Welcome to Your Course Videos</h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">Scroll down to start watching your lessons</p>
            <div className="mt-8">
              <Button
                onClick={scrollToVideos}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Start Watching
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Lessons Section */}
      <section ref={videoListRef} className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Lesson {lesson.id}: {lesson.title}
                  </h2>
                  <p className="text-gray-600">{lesson.description}</p>
                </div>

                <VideoPlayer src={lesson.videoUrl} title={lesson.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Your Course Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
