import type { Wine } from '@/db/schema'

export type DrinkStatus = 'ready' | 'keep' | 'past' | 'unknown'

export const DRINK_LABEL: Record<DrinkStatus, string> = {
  ready: 'Listo',
  keep: 'Guardar',
  past: 'Pronto',
  unknown: 'Sin datos',
}

export function drinkStatus(
  w: Pick<Wine, 'drinkFrom' | 'drinkUntil'>,
  year: number,
): DrinkStatus {
  if (w.drinkFrom === null || w.drinkUntil === null) return 'unknown'
  if (year < w.drinkFrom) return 'keep'
  if (year > w.drinkUntil) return 'past'
  return 'ready'
}

export function defaultWindow(vintage: number | null): {
  drinkFrom: number | null
  drinkUntil: number | null
} {
  if (vintage === null) return { drinkFrom: null, drinkUntil: null }
  return { drinkFrom: vintage + 3, drinkUntil: vintage + 12 }
}
