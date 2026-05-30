export function PixelIcon({ name, className = "" }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    sword: (
      <svg viewBox="0 0 8 24" className={className} fill="currentColor">
        {/* Blade - top point */}
        <rect x="3" y="0" width="2" height="2" />
        {/* Blade - upper section */}
        <rect x="2" y="2" width="4" height="2" />
        <rect x="1" y="4" width="6" height="2" />
        <rect x="1" y="6" width="6" height="4" />
        {/* Guard - crossguard */}
        <rect x="0" y="10" width="8" height="2" />
        {/* Hilt - grip */}
        <rect x="2" y="12" width="4" height="2" />
        <rect x="2" y="14" width="4" height="2" />
        <rect x="2" y="16" width="4" height="2" />
        {/* Pommel - bottom */}
        <rect x="2" y="18" width="4" height="2" />
        <rect x="3" y="20" width="2" height="4" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="6" y="0" width="4" height="2" />
        <rect x="6" y="14" width="4" height="2" />
        <rect x="0" y="6" width="2" height="4" />
        <rect x="14" y="6" width="2" height="4" />
        <rect x="4" y="4" width="8" height="8" />
        <rect x="6" y="6" width="4" height="4" fill="var(--background)" />
        <rect x="2" y="2" width="2" height="2" />
        <rect x="12" y="2" width="2" height="2" />
        <rect x="2" y="12" width="2" height="2" />
        <rect x="12" y="12" width="2" height="2" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="2" y="1" width="12" height="14" />
        <rect x="4" y="3" width="8" height="2" fill="var(--background)" />
        <rect x="4" y="6" width="6" height="1" fill="var(--background)" />
        <rect x="4" y="8" width="7" height="1" fill="var(--background)" />
        <rect x="4" y="10" width="5" height="1" fill="var(--background)" />
        <rect x="1" y="2" width="2" height="12" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="6" y="2" width="4" height="4" />
        <rect x="5" y="3" width="1" height="2" />
        <rect x="10" y="3" width="1" height="2" />
        <rect x="4" y="8" width="8" height="6" />
        <rect x="3" y="9" width="2" height="5" />
        <rect x="11" y="9" width="2" height="5" />
      </svg>
    ),
    key: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="1" y="3" width="4" height="4" />
        <rect x="2" y="4" width="2" height="2" fill="var(--background)" />
        <rect x="4" y="5" width="10" height="2" />
        <rect x="12" y="7" width="2" height="2" />
        <rect x="9" y="7" width="2" height="2" />
      </svg>
    ),
    journal: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="3" y="1" width="10" height="14" />
        <rect x="5" y="3" width="6" height="1" fill="var(--background)" />
        <rect x="5" y="5" width="6" height="1" fill="var(--background)" />
        <rect x="5" y="7" width="4" height="1" fill="var(--background)" />
        <rect x="1" y="2" width="3" height="2" />
        <rect x="1" y="6" width="3" height="2" />
        <rect x="1" y="10" width="3" height="2" />
      </svg>
    ),
    tree: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="7" y="12" width="2" height="4" />
        <rect x="5" y="8" width="6" height="4" />
        <rect x="4" y="4" width="8" height="4" />
        <rect x="6" y="0" width="4" height="4" />
        <rect x="3" y="6" width="2" height="2" />
        <rect x="11" y="6" width="2" height="2" />
      </svg>
    ),
    chest: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="1" y="4" width="14" height="10" />
        <rect x="2" y="5" width="12" height="3" fill="var(--background)" />
        <rect x="6" y="8" width="4" height="3" fill="var(--pixel-gold)" />
        <rect x="7" y="9" width="2" height="1" fill="var(--background)" />
        <rect x="0" y="6" width="2" height="2" />
        <rect x="14" y="6" width="2" height="2" />
      </svg>
    ),
    trophy: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="4" y="1" width="8" height="8" />
        <rect x="5" y="2" width="6" height="6" fill="var(--background)" />
        <rect x="6" y="3" width="4" height="4" fill="var(--pixel-gold)" />
        <rect x="2" y="2" width="3" height="4" />
        <rect x="11" y="2" width="3" height="4" />
        <rect x="6" y="9" width="4" height="2" />
        <rect x="5" y="11" width="6" height="2" />
        <rect x="4" y="13" width="8" height="2" />
      </svg>
    ),
    quest: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="2" y="0" width="12" height="2" />
        <rect x="1" y="2" width="2" height="12" />
        <rect x="13" y="2" width="2" height="12" />
        <rect x="2" y="14" width="12" height="2" />
        <rect x="6" y="4" width="4" height="1" fill="var(--pixel-gold)" />
        <rect x="6" y="6" width="4" height="1" fill="var(--pixel-gold)" />
        <rect x="6" y="8" width="4" height="1" fill="var(--muted)" />
        <rect x="6" y="10" width="4" height="1" fill="var(--muted)" />
        <rect x="4" y="4" width="2" height="1" fill="var(--pixel-green)" />
        <rect x="4" y="6" width="2" height="1" fill="var(--pixel-green)" />
      </svg>
    ),
    players: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="2" y="2" width="4" height="4" />
        <rect x="1" y="7" width="6" height="5" />
        <rect x="10" y="2" width="4" height="4" />
        <rect x="9" y="7" width="6" height="5" />
        <rect x="6" y="4" width="4" height="4" fill="var(--pixel-gold)" />
        <rect x="5" y="9" width="6" height="6" fill="var(--pixel-gold)" />
      </svg>
    ),
    newgame: (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <rect x="3" y="3" width="10" height="10" />
        <rect x="7" y="5" width="2" height="6" fill="var(--background)" />
        <rect x="5" y="7" width="6" height="2" fill="var(--background)" />
      </svg>
    ),
  }

  return icons[name] || null
}
