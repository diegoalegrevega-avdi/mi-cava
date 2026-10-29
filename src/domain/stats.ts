import type { WineType, WineWithStock } from '@/db/schema'
import { drinkStatus } from '@/domain/drinkWindow'

export interface CellarStats {
  bottles: number
  references: number
  valueCents: number
  byType: Record<WineType | 'sinTipo', number>
  ready: number
  keep: number
  past: number
  unknown: number
}

const EMPTY_BY_TYPE: Record<WineType | 'sinTipo', number> = {
  tinto: 0,
  blanco: 0,
  rosado: 0,
  espumoso: 0,
  dulce: 0,
  fortificado: 0,
  sinTipo: 0,
}

export function computeStats(wines: WineWithStock[], year: number): CellarStats {
  const stats: CellarStats = {
    bottles: 0,
    references: 0,
    valueCents: 0,
    byType: { ...EMPTY_BY_TYPE },
    ready: 0,
    keep: 0,
    past: 0,
    unknown: 0,
  }
  for (const w of wines) {
    if (w.stock <= 0) continue
    const n = w.stock
    stats.references += 1
    stats.bottles += n
    stats.valueCents += (w.priceCents ?? 0) * n
    stats.byType[w.type ?? 'sinTipo'] += n
    stats[drinkStatus(w, year)] += n
  }
  return stats
}
