export const SUPPORT_URL = 'https://buymeacoffee.com/dialve'
export const SUPPORT_STORAGE_KEY = 'micava.support'

/** Show the prompt on every Nth app open… */
export const SUPPORT_EVERY_VISITS = 5
/** …and never more than once inside this window. */
export const SUPPORT_COOLDOWN_DAYS = 3

const DAY_MS = 86_400_000

export interface SupportState {
  visits: number
  lastShown: number
}

export function shouldShowSupport(visits: number, lastShown: number, now: number): boolean {
  if (visits < SUPPORT_EVERY_VISITS || visits % SUPPORT_EVERY_VISITS !== 0) return false
  return now - lastShown >= SUPPORT_COOLDOWN_DAYS * DAY_MS
}
