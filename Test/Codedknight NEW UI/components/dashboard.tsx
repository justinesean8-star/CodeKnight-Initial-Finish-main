"use client"

import { useState } from "react"
import { PixelButton } from "./pixel-button"
import { PixelPanel } from "./pixel-panel"
import { PixelIcon } from "./pixel-icons"
import { cn } from "@/lib/utils"

interface DashboardProps {
  onBack?: () => void
}

// Mock data for demonstration
const mockPlayers = [
  { name: "SHADOWBLADE", level: 42, status: "online" },
  { name: "FIREWIZARD", level: 38, status: "online" },
  { name: "ICEKNIGH", level: 35, status: "offline" },
  { name: "STORMRIDER", level: 31, status: "online" },
]

const mockJournalEntries = [
  { title: "DRAGON SLAIN", date: "DAY 142" },
  { title: "NEW ALLY FOUND", date: "DAY 139" },
  { title: "QUEST COMPLETE", date: "DAY 135" },
]

const mockSkills = [
  { name: "STRENGTH", level: 15, maxLevel: 20, color: "bg-destructive" },
  { name: "MAGIC", level: 12, maxLevel: 20, color: "bg-secondary" },
  { name: "STEALTH", level: 8, maxLevel: 20, color: "bg-accent" },
  { name: "DEFENSE", level: 18, maxLevel: 20, color: "bg-primary" },
]

const mockInventory = [
  { name: "SWORD", rarity: "rare", slot: "weapon" },
  { name: "SHIELD", rarity: "common", slot: "offhand" },
  { name: "POTION", rarity: "common", slot: "consumable" },
  { name: "RING", rarity: "epic", slot: "accessory" },
  { name: "ARMOR", rarity: "rare", slot: "body" },
  { name: "BOOTS", rarity: "common", slot: "feet" },
]

const mockLeaderboard = [
  { rank: 1, name: "DRAGONLORD", score: 99999 },
  { rank: 2, name: "SHADOWKING", score: 85420 },
  { rank: 3, name: "FIREMAGE", score: 72100 },
  { rank: 4, name: "YOU", score: 45000, isPlayer: true },
  { rank: 5, name: "STORMBOW", score: 38900 },
]

const mockQuests = [
  { name: "DEFEAT 10 GOBLINS", progress: 7, total: 10, reward: "500 XP" },
  { name: "COLLECT HERBS", progress: 3, total: 5, reward: "POTION" },
  { name: "VISIT BLACKSMITH", progress: 0, total: 1, reward: "100 GOLD" },
]

export function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("players")

  const tabs = [
    { id: "players", label: "PLAYERS", icon: "players" },
    { id: "journal", label: "JOURNAL", icon: "journal" },
    { id: "skills", label: "SKILLS", icon: "tree" },
    { id: "inventory", label: "ITEMS", icon: "chest" },
    { id: "leaderboard", label: "RANKS", icon: "trophy" },
    { id: "quests", label: "QUESTS", icon: "quest" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <PixelButton variant="secondary" size="sm" onClick={onBack}>
            {"< BACK"}
          </PixelButton>
          <h1 className="text-lg sm:text-xl text-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            DASHBOARD
          </h1>
        </div>
        
        {/* Player info bar */}
        <PixelPanel variant="inset" className="px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <PixelIcon name="user" className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-foreground">HERO_ONE</p>
              <p className="text-[8px] text-muted-foreground">LVL 42</p>
            </div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-[8px]">
            <span className="text-primary">1250</span>
            <span className="text-muted-foreground ml-1">GOLD</span>
          </div>
        </PixelPanel>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-[8px] transition-all duration-75",
              "border-2 shadow-[inset_-2px_-2px_0px_0px_rgba(0,0,0,0.3),inset_2px_2px_0px_0px_rgba(255,255,255,0.1)]",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary translate-y-0.5 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                : "bg-card text-foreground border-border hover:brightness-110"
            )}
          >
            <PixelIcon name={tab.icon} className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Panel */}
        <div className="lg:col-span-2">
          <PixelPanel variant="default" className="p-6 min-h-[400px]">
            {activeTab === "players" && <PlayersSection />}
            {activeTab === "journal" && <JournalSection />}
            {activeTab === "skills" && <SkillsSection />}
            {activeTab === "inventory" && <InventorySection />}
            {activeTab === "leaderboard" && <LeaderboardSection />}
            {activeTab === "quests" && <QuestsSection />}
          </PixelPanel>
        </div>

        {/* Right Column - Quick Info */}
        <div className="flex flex-col gap-6">
          {/* Daily Quest Summary */}
          <PixelPanel variant="gold" title="DAILY QUEST" className="p-4 pt-6">
            <div className="space-y-3">
              {mockQuests.slice(0, 2).map((quest, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[8px] text-foreground">{quest.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)]">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground">
                      {quest.progress}/{quest.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PixelPanel>

          {/* Stats Summary */}
          <PixelPanel variant="default" title="STATS" className="p-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="QUESTS" value="142" />
              <StatBox label="KILLS" value="1.2K" />
              <StatBox label="HOURS" value="89" />
              <StatBox label="DEATHS" value="23" />
            </div>
          </PixelPanel>

          {/* Recent Activity */}
          <PixelPanel variant="inset" title="ACTIVITY" className="p-4 pt-6">
            <div className="space-y-2">
              <ActivityItem text="LEVELED UP TO 42!" type="success" />
              <ActivityItem text="FOUND RARE SWORD" type="rare" />
              <ActivityItem text="JOINED GUILD" type="info" />
            </div>
          </PixelPanel>
        </div>
      </div>
    </div>
  )
}

function PlayersSection() {
  return (
    <div>
      <h2 className="text-sm text-primary mb-4 flex items-center gap-2">
        <PixelIcon name="players" className="w-5 h-5" />
        ONLINE PLAYERS
      </h2>
      <div className="grid gap-3">
        {mockPlayers.map((player, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-muted border-2 border-border shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-card border-2 border-border flex items-center justify-center">
                <PixelIcon name="user" className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-foreground">{player.name}</p>
                <p className="text-[8px] text-muted-foreground">LEVEL {player.level}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3",
              player.status === "online" ? "bg-[oklch(0.65_0.18_145)]" : "bg-muted-foreground"
            )} />
          </div>
        ))}
      </div>
    </div>
  )
}

function JournalSection() {
  return (
    <div>
      <h2 className="text-sm text-primary mb-4 flex items-center gap-2">
        <PixelIcon name="journal" className="w-5 h-5" />
        ADVENTURE LOG
      </h2>
      <div className="space-y-4">
        {mockJournalEntries.map((entry, i) => (
          <div key={i} className="p-4 bg-muted border-2 border-border shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] text-primary">{entry.title}</h3>
              <span className="text-[8px] text-muted-foreground">{entry.date}</span>
            </div>
            <p className="text-[8px] text-foreground/80 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillsSection() {
  return (
    <div>
      <h2 className="text-sm text-primary mb-4 flex items-center gap-2">
        <PixelIcon name="tree" className="w-5 h-5" />
        SKILL TREE
      </h2>
      <div className="grid gap-4">
        {mockSkills.map((skill, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-foreground">{skill.name}</span>
              <span className="text-muted-foreground">{skill.level}/{skill.maxLevel}</span>
            </div>
            <div className="h-4 bg-muted shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)] border-2 border-border">
              <div
                className={cn("h-full transition-all", skill.color)}
                style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 bg-muted/50 border-2 border-dashed border-border">
          <p className="text-[8px] text-muted-foreground text-center">
            SKILL POINTS AVAILABLE: <span className="text-primary">3</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function InventorySection() {
  const rarityColors: Record<string, string> = {
    common: "border-muted-foreground",
    rare: "border-secondary",
    epic: "border-primary",
  }

  return (
    <div>
      <h2 className="text-sm text-primary mb-4 flex items-center gap-2">
        <PixelIcon name="chest" className="w-5 h-5" />
        INVENTORY
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {mockInventory.map((item, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square bg-muted border-4 flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:brightness-110",
              "shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
              rarityColors[item.rarity]
            )}
          >
            <PixelIcon name="chest" className="w-6 h-6 text-foreground mb-1" />
            <p className="text-[6px] text-foreground text-center truncate w-full">{item.name}</p>
          </div>
        ))}
        {/* Empty slots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square bg-muted/30 border-2 border-dashed border-border"
          />
        ))}
      </div>
      <p className="mt-4 text-[8px] text-muted-foreground">
        SLOTS: <span className="text-foreground">6/12</span>
      </p>
    </div>
  )
}

function LeaderboardSection() {
  return (
    <div>
      <h2 className="text-sm text-primary mb-4 flex items-center gap-2">
        <PixelIcon name="trophy" className="w-5 h-5" />
        LEADERBOARD
      </h2>
      <div className="space-y-2">
        {mockLeaderboard.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between p-3 border-2",
              entry.isPlayer
                ? "bg-primary/20 border-primary"
                : "bg-muted border-border shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "w-8 h-8 flex items-center justify-center text-[10px] font-bold",
                entry.rank === 1 ? "bg-primary text-primary-foreground" :
                entry.rank === 2 ? "bg-secondary text-secondary-foreground" :
                entry.rank === 3 ? "bg-accent text-accent-foreground" :
                "bg-card text-foreground"
              )}>
                #{entry.rank}
              </span>
              <span className={cn(
                "text-[10px]",
                entry.isPlayer ? "text-primary" : "text-foreground"
              )}>
                {entry.name}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {entry.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestsSection() {
  return (
    <div>
      <h2 className="text-sm text-primary mb-4 flex items-center gap-2">
        <PixelIcon name="quest" className="w-5 h-5" />
        DAILY QUESTS
      </h2>
      <div className="space-y-4">
        {mockQuests.map((quest, i) => (
          <div
            key={i}
            className="p-4 bg-muted border-2 border-border shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] text-foreground">{quest.name}</h3>
              <span className="text-[8px] text-primary px-2 py-0.5 bg-primary/20 border border-primary">
                {quest.reward}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-card shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)] border border-border">
                <div
                  className={cn(
                    "h-full transition-all",
                    quest.progress === quest.total ? "bg-[oklch(0.65_0.18_145)]" : "bg-primary"
                  )}
                  style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground min-w-[40px] text-right">
                {quest.progress}/{quest.total}
              </span>
            </div>
            {quest.progress === quest.total && (
              <PixelButton variant="gold" size="sm" className="w-full mt-3">
                CLAIM REWARD
              </PixelButton>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-muted shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)] text-center">
      <p className="text-lg text-primary">{value}</p>
      <p className="text-[8px] text-muted-foreground">{label}</p>
    </div>
  )
}

function ActivityItem({ text, type }: { text: string; type: "success" | "rare" | "info" }) {
  const colors = {
    success: "text-[oklch(0.65_0.18_145)]",
    rare: "text-secondary",
    info: "text-muted-foreground",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2", colors[type].replace("text-", "bg-"))} />
      <p className={cn("text-[8px]", colors[type])}>{text}</p>
    </div>
  )
}
