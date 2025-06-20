"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className={cn(
            "animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6B35] p-1",
            sizeClasses[size],
          )}
        >
          <div className="rounded-full bg-[#0D0D0D] w-full h-full"></div>
        </div>

        {/* Inner pulsing core */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-[#FFFF00] to-[#FF8C00] animate-pulse opacity-60",
            sizeClasses[size],
          )}
        ></div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#FFD700] rounded-full animate-ping"></div>
      </div>

      {/* Loading text */}
      {text && (
        <div
          className={cn(
            "bg-gradient-to-r from-[#FFD700] to-[#FF6B35] bg-clip-text text-transparent font-semibold animate-pulse",
            textSizeClasses[size],
          )}
        >
          {text}
        </div>
      )}
    </div>
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className="w-3 h-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-gradient-to-r from-[#FF8C00] to-[#FF6B35] rounded-full animate-bounce"></div>
    </div>
  )
}

export function LoadingBars({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end justify-center space-x-1", className)}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 bg-gradient-to-t from-[#FFD700] to-[#FF6B35] rounded-full animate-pulse"
          style={{
            height: `${20 + (i % 3) * 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1s",
          }}
        ></div>
      ))}
    </div>
  )
}

export function LoadingRipple({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-16 h-16", className)}>
      <div className="absolute inset-0 rounded-full border-4 border-[#FFD700] animate-ping"></div>
      <div className="absolute inset-2 rounded-full border-4 border-[#FFA500] animate-ping [animation-delay:0.5s]"></div>
      <div className="absolute inset-4 rounded-full border-4 border-[#FF6B35] animate-ping [animation-delay:1s]"></div>
    </div>
  )
}
