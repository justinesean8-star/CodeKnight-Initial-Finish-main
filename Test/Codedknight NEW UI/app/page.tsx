"use client"

import { useState } from "react"
import { MainMenu } from "@/components/main-menu"
import { DashboardPanel } from "@/components/dashboard-panel"
import { LanguageSelection } from "@/components/language-selection"

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [showLanguageSelection, setShowLanguageSelection] = useState(false)

  const handleNewGame = () => {
    setShowLanguageSelection(true)
  }

  const handleCloseLanguageSelection = () => {
    setShowLanguageSelection(false)
  }

  const handleSelectLanguage = (languageId: string) => {
    console.log("Selected language:", languageId)
    setShowLanguageSelection(false)
    // Here you would navigate to the game/learning screen
  }

  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev)
  }

  const handleCloseDashboard = () => {
    setShowDashboard(false)
  }

  return (
    <main className="min-h-screen bg-background scanlines relative overflow-hidden">
      <MainMenu
        onNewGame={handleNewGame}
        onOpenDashboard={handleToggleDashboard}
        onSettings={() => console.log("Settings clicked")}
        onHowToPlay={() => console.log("How to Play clicked")}
        onLogin={() => console.log("Login clicked")}
        onRegister={() => console.log("Register clicked")}
      />
      
      <DashboardPanel isOpen={showDashboard} onClose={handleCloseDashboard} />
      
      <LanguageSelection 
        isOpen={showLanguageSelection} 
        onClose={handleCloseLanguageSelection}
        onSelectLanguage={handleSelectLanguage}
      />
    </main>
  )
}
