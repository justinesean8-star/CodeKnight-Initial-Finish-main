"use client"

import { PixelButton } from "./pixel-button"
import { PixelPanel } from "./pixel-panel"
import { PixelIcon } from "./pixel-icons"

interface MainMenuProps {
  onNewGame?: () => void
  onOpenDashboard?: () => void
  onSettings?: () => void
  onHowToPlay?: () => void
  onDevelopers?: () => void
  onLogin?: () => void
  onRegister?: () => void
}

export function MainMenu({
  onNewGame,
  onOpenDashboard,
  onSettings,
  onHowToPlay,
  onDevelopers,
  onLogin,
  onRegister,
}: MainMenuProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
      {/* Dashboard Arrow Button - Left Side */}
      <button
        onClick={onOpenDashboard}
        className="group absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 p-3 
                   bg-card border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]
                   hover:bg-muted active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]
                   transition-all duration-100"
      >
        <svg viewBox="0 0 12 16" className="w-4 h-6 text-primary" fill="currentColor">
          {/* Pixel arrow pointing right */}
          <rect x="0" y="6" width="4" height="4" />
          <rect x="4" y="4" width="4" height="8" />
          <rect x="8" y="2" width="4" height="12" />
        </svg>
        <span className="hidden group-hover:block group-focus:block text-[10px] text-primary font-bold whitespace-nowrap">
          Dashboard
        </span>
      </button>
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Game Logo/Title with Knight */}
      <div className="relative mb-12 flex items-center justify-center gap-6">
        {/* Knight character - left */}
        <div className="hidden sm:block pixel-float" style={{ animationDelay: "0.3s" }}>
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Knight_1-HcFQA05SVUBeQL2mr2HMxdSm5FJmUj.gif"
            alt="Pixel Knight Character"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
            style={{ 
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px rgba(255, 215, 0, 0.6))",
              boxShadow: "0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.3)"
            }}
          />
        </div>
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl text-primary tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            CODE KNIGHT
          </h1>
          <p className="mt-4 text-[8px] sm:text-[10px] text-muted-foreground tracking-widest animate-pulse">
            {">>> PRESS START <<<"}
          </p>
        </div>
        
        {/* Decorative pixel sword - right */}
        <div className="hidden md:block">
          <PixelIcon name="sword" className="w-12 h-12 text-primary rotate-[135deg] pixel-float" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>

      {/* Main Menu Panel */}
      <PixelPanel variant="gold" className="w-full max-w-md p-8">
        <div className="flex flex-col gap-4">
          {/* New Game - Primary action */}
          <PixelButton
            variant="gold"
            size="lg"
            onClick={onNewGame}
            className="w-full flex items-center justify-center gap-3"
          >
            <PixelIcon name="newgame" className="w-5 h-5" />
            New Game
          </PixelButton>

          {/* Settings */}
          <PixelButton
            variant="secondary"
            size="md"
            onClick={onSettings}
            className="w-full flex items-center justify-center gap-3"
          >
            <PixelIcon name="settings" className="w-4 h-4" />
            Settings
          </PixelButton>

          {/* How to Play */}
          <PixelButton
            variant="secondary"
            size="md"
            onClick={onHowToPlay}
            className="w-full flex items-center justify-center gap-3"
          >
            <PixelIcon name="book" className="w-4 h-4" />
            How to Play
          </PixelButton>

          {/* Developers */}
          <PixelButton
            variant="secondary"
            size="sm"
            onClick={onDevelopers}
            className="w-full flex items-center justify-center gap-2 text-[10px]"
          >
            <PixelIcon name="settings" className="w-3 h-3" />
            Developers
          </PixelButton>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-1 bg-border shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)]" />
            <span className="text-[8px] text-muted-foreground">OR</span>
            <div className="flex-1 h-1 bg-border shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)]" />
          </div>

          {/* Auth buttons row */}
          <div className="flex gap-3">
            <PixelButton
              variant="primary"
              size="md"
              onClick={onLogin}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <PixelIcon name="key" className="w-4 h-4" />
              Log In
            </PixelButton>

            <PixelButton
              variant="primary"
              size="md"
              onClick={onRegister}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <PixelIcon name="user" className="w-4 h-4" />
              Register
            </PixelButton>
          </div>
        </div>
      </PixelPanel>

      {/* Footer */}
      <p className="mt-8 text-[8px] text-muted-foreground">
        © 2024 CODE KNIGHT STUDIOS
      </p>
    </div>
  )
}
