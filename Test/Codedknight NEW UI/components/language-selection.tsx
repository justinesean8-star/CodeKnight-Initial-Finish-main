"use client"

import { useState, useEffect } from "react"
import { PixelButton } from "./pixel-button"

interface Language {
  id: string
  name: string
  icon: JSX.Element
  color: string
  glowColor: string
  description: string
}

const languages: Language[] = [
  {
    id: "c",
    name: "C",
    color: "#A8B9CC",
    glowColor: "rgba(168, 185, 204, 0.6)",
    description: "The foundation of systems programming",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <rect x="4" y="2" width="16" height="4" />
        <rect x="4" y="2" width="4" height="20" />
        <rect x="4" y="18" width="16" height="4" />
      </svg>
    ),
  },
  {
    id: "cpp",
    name: "C++",
    color: "#00599C",
    glowColor: "rgba(0, 89, 156, 0.6)",
    description: "Power meets object-oriented design",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <rect x="2" y="2" width="12" height="4" />
        <rect x="2" y="2" width="4" height="20" />
        <rect x="2" y="18" width="12" height="4" />
        <rect x="16" y="8" width="6" height="4" />
        <rect x="18" y="6" width="2" height="8" />
        <rect x="16" y="16" width="6" height="4" />
        <rect x="18" y="14" width="2" height="8" />
      </svg>
    ),
  },
  {
    id: "java",
    name: "Java",
    color: "#ED8B00",
    glowColor: "rgba(237, 139, 0, 0.6)",
    description: "Write once, run anywhere",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <rect x="8" y="2" width="8" height="4" />
        <rect x="12" y="2" width="4" height="14" />
        <rect x="4" y="14" width="8" height="4" />
        <rect x="4" y="14" width="4" height="6" />
        <rect x="4" y="18" width="16" height="4" />
      </svg>
    ),
  },
  {
    id: "python",
    name: "Python",
    color: "#3776AB",
    glowColor: "rgba(55, 118, 171, 0.6)",
    description: "Simple, powerful, and versatile",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <rect x="4" y="2" width="16" height="4" />
        <rect x="4" y="2" width="4" height="10" />
        <rect x="4" y="10" width="16" height="4" />
        <rect x="16" y="10" width="4" height="12" />
        <rect x="4" y="18" width="16" height="4" />
      </svg>
    ),
  },
]

interface LanguageSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelectLanguage: (languageId: string) => void
  onOpenDashboard?: () => void
}

export function LanguageSelection({ isOpen, onClose, onSelectLanguage }: LanguageSelectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null)
  const [isEntering, setIsEntering] = useState(false)
  const [cardsVisible, setCardsVisible] = useState<boolean[]>([false, false, false, false])
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsEntering(true)
      setShowContent(false)
      setCardsVisible([false, false, false, false])
      
      // Stagger the entrance animation
      setTimeout(() => setShowContent(true), 300)
      
      // Stagger card appearances
      languages.forEach((_, index) => {
        setTimeout(() => {
          setCardsVisible(prev => {
            const newState = [...prev]
            newState[index] = true
            return newState
          })
        }, 500 + index * 150)
      })
    } else {
      setIsEntering(false)
      setShowContent(false)
      setCardsVisible([false, false, false, false])
      setSelectedLanguage(null)
    }
  }, [isOpen])

  const handleSelect = (languageId: string) => {
    setSelectedLanguage(languageId)
  }

  const handleConfirm = () => {
    if (selectedLanguage) {
      onSelectLanguage(selectedLanguage)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isEntering ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Animated background with grid pattern */}
      <div 
        className="absolute inset-0 bg-background"
        style={{
          backgroundImage: `
            linear-gradient(rgba(130, 100, 50, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(130, 100, 50, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div 
        className={`relative z-10 w-full max-w-4xl ml-16 sm:ml-20 mr-4 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 
            className={`text-lg sm:text-2xl md:text-3xl text-primary mb-3 tracking-wider transition-all duration-500 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{ 
              textShadow: "0 0 20px rgba(200, 170, 50, 0.5), 4px 4px 0 rgba(0,0,0,0.5)" 
            }}
          >
            CHOOSE YOUR PATH
          </h1>
          <p 
            className={`text-[10px] sm:text-xs text-muted-foreground transition-all duration-500 delay-200 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            Select a programming language to begin your journey
          </p>
        </div>

        {/* Language cards - Hexagonal-inspired grid layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 px-2">
          {languages.map((lang, index) => {
            const isSelected = selectedLanguage === lang.id
            const isHovered = hoveredLanguage === lang.id
            
            return (
              <button
                key={lang.id}
                onClick={() => handleSelect(lang.id)}
                onMouseEnter={() => setHoveredLanguage(lang.id)}
                onMouseLeave={() => setHoveredLanguage(null)}
                className={`
                  relative group p-3 sm:p-4 bg-card border-4 
                  transition-all duration-300 transform
                  ${cardsVisible[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
                  ${isSelected 
                    ? "border-primary scale-105 z-10" 
                    : "border-border hover:border-muted-foreground hover:scale-102"
                  }
                `}
                style={{
                  boxShadow: isSelected 
                    ? `0 0 30px ${lang.glowColor}, inset -4px -4px 0 var(--pixel-dark), inset 4px 4px 0 var(--pixel-highlight), 8px 8px 0 rgba(0,0,0,0.5)`
                    : isHovered
                    ? `0 0 15px ${lang.glowColor}, inset -4px -4px 0 var(--pixel-dark), inset 4px 4px 0 var(--pixel-highlight), 6px 6px 0 rgba(0,0,0,0.4)`
                    : "inset -4px -4px 0 var(--pixel-dark), inset 4px 4px 0 var(--pixel-highlight), 4px 4px 0 rgba(0,0,0,0.3)",
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary flex items-center justify-center border-2 border-primary-foreground">
                    <svg viewBox="0 0 8 8" className="w-3 h-3 text-primary-foreground" fill="currentColor">
                      <rect x="1" y="4" width="2" height="2" />
                      <rect x="3" y="5" width="2" height="2" />
                      <rect x="5" y="3" width="2" height="2" />
                      <rect x="6" y="1" width="2" height="2" />
                    </svg>
                  </div>
                )}

                {/* Language icon */}
                <div 
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 transition-all duration-300
                    ${isSelected || isHovered ? "scale-110" : "scale-100"}
                  `}
                  style={{ 
                    color: lang.color,
                    filter: isSelected 
                      ? `drop-shadow(0 0 8px ${lang.glowColor})`
                      : isHovered 
                      ? `drop-shadow(0 0 4px ${lang.glowColor})`
                      : "none",
                  }}
                >
                  {lang.icon}
                </div>

                {/* Language name */}
                <h3 
                  className={`
                    text-sm sm:text-base font-bold mb-2 transition-colors duration-300
                    ${isSelected ? "text-primary" : "text-foreground"}
                  `}
                >
                  {lang.name}
                </h3>

                {/* Description - only visible on hover/select */}
                <p 
                  className={`
                    text-[8px] sm:text-[10px] text-muted-foreground leading-relaxed
                    transition-all duration-300
                    ${isSelected || isHovered ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}
                  `}
                  style={{ overflow: "hidden" }}
                >
                  {lang.description}
                </p>

                {/* Animated border pulse for selected */}
                {isSelected && (
                  <div 
                    className="absolute inset-0 border-4 border-primary pointer-events-none"
                    style={{
                      animation: "pulse-border 1.5s ease-in-out infinite",
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Action buttons */}
        <div 
          className={`
            flex flex-col sm:flex-row items-center justify-center gap-4 
            transition-all duration-500 delay-700
            ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <PixelButton
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-40"
          >
            Back
          </PixelButton>
          
          <PixelButton
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            disabled={!selectedLanguage}
            className={`
              w-48 transition-all duration-300
              ${selectedLanguage 
                ? "opacity-100 scale-100" 
                : "opacity-50 scale-95 cursor-not-allowed"
              }
            `}
          >
            {selectedLanguage ? "Start Quest" : "Select Language"}
          </PixelButton>
        </div>

        {/* Selected language indicator */}
        {selectedLanguage && (
          <div 
            className="mt-6 text-center animate-pulse"
          >
            <p className="text-[10px] text-primary">
              Ready to learn {languages.find(l => l.id === selectedLanguage)?.name}!
            </p>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-card border-4 border-border hover:border-primary transition-colors duration-200"
        style={{
          boxShadow: "inset -2px -2px 0 var(--pixel-dark), inset 2px 2px 0 var(--pixel-highlight)",
        }}
      >
        <svg viewBox="0 0 8 8" className="w-4 h-4 text-foreground" fill="currentColor">
          <rect x="1" y="0" width="2" height="2" />
          <rect x="5" y="0" width="2" height="2" />
          <rect x="2" y="1" width="2" height="2" />
          <rect x="4" y="1" width="2" height="2" />
          <rect x="3" y="2" width="2" height="4" />
          <rect x="2" y="5" width="2" height="2" />
          <rect x="4" y="5" width="2" height="2" />
          <rect x="1" y="6" width="2" height="2" />
          <rect x="5" y="6" width="2" height="2" />
        </svg>
      </button>

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
