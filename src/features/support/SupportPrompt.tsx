import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/hooks/useI18n'
import {
  SUPPORT_STORAGE_KEY,
  SUPPORT_URL,
  shouldShowSupport,
  type SupportState,
} from '@/domain/support'

function readState(): SupportState {
  try {
    const raw = JSON.parse(localStorage.getItem(SUPPORT_STORAGE_KEY) ?? '{}') as Partial<SupportState>
    return { visits: Number(raw.visits) || 0, lastShown: Number(raw.lastShown) || 0 }
  } catch {
    return { visits: 0, lastShown: 0 }
  }
}

/** Counts this open and tells whether the prompt is due. Runs once per page load. */
function beginVisit(): boolean {
  const now = Date.now()
  const { visits, lastShown } = readState()
  const show = shouldShowSupport(visits + 1, lastShown, now)
  try {
    localStorage.setItem(
      SUPPORT_STORAGE_KEY,
      JSON.stringify({ visits: visits + 1, lastShown: show ? now : lastShown }),
    )
  } catch {
    // Storage blocked or full: the prompt simply never shows.
  }
  return show
}

const PROMPT_DUE_ON_THIS_LOAD = beginVisit()

/** Recurring "buy me a coffee" prompt: every Nth open, at most once per cooldown. */
export function SupportPrompt() {
  const { t } = useI18n()
  const [open, setOpen] = useState(PROMPT_DUE_ON_THIS_LOAD)

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title={t.support.title}>
      <p className="mb-4 text-sm text-muted">{t.support.body}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-wine px-4 text-[15px] font-medium text-[#f2ede7] transition hover:brightness-110"
        >
          <span aria-hidden="true">☕</span>
          {t.support.coffee}
        </a>
        <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
          {t.support.later}
        </Button>
      </div>
    </Sheet>
  )
}
