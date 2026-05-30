"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface PixelButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "gold" | "danger"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function PixelButton({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
  disabled = false,
}: PixelButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    gold: "bg-[oklch(0.82_0.18_85)] text-[oklch(0.12_0.02_260)]",
    danger: "bg-destructive text-destructive-foreground",
  }

  const sizeStyles = {
    sm: "px-3 py-1.5 text-[8px]",
    md: "px-6 py-3 text-[10px]",
    lg: "px-8 py-4 text-xs",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        "relative font-sans uppercase tracking-wider transition-all duration-75",
        "border-4 border-transparent",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variantStyles[variant],
        sizeStyles[size],
        isPressed
          ? "translate-y-0.5 shadow-[inset_3px_3px_0px_0px_rgba(0,0,0,0.4),inset_-2px_-2px_0px_0px_rgba(255,255,255,0.2)]"
          : "shadow-[inset_-3px_-3px_0px_0px_rgba(0,0,0,0.4),inset_3px_3px_0px_0px_rgba(255,255,255,0.2),4px_4px_0px_0px_rgba(0,0,0,0.5)]",
        "hover:brightness-110",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative z-10 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
        {children}
      </span>
    </button>
  )
}
