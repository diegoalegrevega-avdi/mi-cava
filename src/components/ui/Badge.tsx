import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'ready' | 'keep' | 'past' | 'unknown' | 'neutral'

const TONES: Record<BadgeTone, string> = {
  ready: 'border-[#4b8a5c]/50 bg-[#4b8a5c]/15 text-[#8fce9d]',
  keep: 'border-gold/40 bg-gold/12 text-gold',
  past: 'border-[#c0453f]/40 bg-[#c0453f]/12 text-[#de8d86]',
  unknown: 'border-border bg-surface-2 text-muted',
  neutral: 'border-border bg-surface-2 text-text',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {children}
    </span>
  )
}
