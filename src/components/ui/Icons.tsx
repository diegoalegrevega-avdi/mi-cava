import type { NavId } from '@/nav'

const PATHS: Record<NavId, string> = {
  cava: 'M8 3h8M9 3v4.5L5.5 13a4 4 0 003.4 6h6.2a4 4 0 003.4-6L15 7.5V3M7 14h10',
  add: 'M12 5v14M5 12h14',
  historial: 'M12 8v4l3 2M3.5 12a8.5 8.5 0 101.7-5.1M3.5 4v3.5H7',
  ajustes:
    'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2V22a2 2 0 11-4 0v-.2A1.7 1.7 0 006 20l-.1.1a2 2 0 11-2.8-2.8L3.2 17A1.7 1.7 0 002 14.1H2a2 2 0 110-4h.2A1.7 1.7 0 004 8.9L3.9 8.8a2 2 0 112.8-2.8l.1.1A1.7 1.7 0 009.7 5V5a2 2 0 114 0v.2A1.7 1.7 0 0016.6 6l.1-.1a2 2 0 112.8 2.8l-.1.1A1.7 1.7 0 0020 11.7h.3a2 2 0 010 4H20a1.7 1.7 0 00-1.6 1z',
}

export function NavIcon({ id, className }: { id: NavId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'size-6'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[id]} />
    </svg>
  )
}

export function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'size-5'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  )
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'size-5'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
    </svg>
  )
}
