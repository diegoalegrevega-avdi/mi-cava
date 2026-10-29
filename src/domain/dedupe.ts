import type { Wine } from '@/db/schema'
import { normalize } from '@/domain/normalize'

export function wineKey(w: Pick<Wine, 'name' | 'vintage' | 'winery'>): string {
  return `${normalize(w.name)}|${w.vintage ?? ''}|${normalize(w.winery)}`
}

export function findDuplicate(
  wines: Wine[],
  d: Pick<Wine, 'name' | 'vintage' | 'winery'>,
): { exact: Wine | null; possible: Wine[] } {
  const key = wineKey(d)
  const nameVintage = (w: Pick<Wine, 'name' | 'vintage'>) => `${normalize(w.name)}|${w.vintage ?? ''}`
  const exact = wines.find((w) => wineKey(w) === key && w.winery.trim() !== '')
  const possible = wines.filter(
    (w) => nameVintage(w) === nameVintage(d) && (!exact || w.id !== exact.id),
  )
  return { exact: exact ?? null, possible }
}
