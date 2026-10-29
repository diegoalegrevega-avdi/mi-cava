import type { Wine, WineWithStock } from '@/db/schema'
import { normalize } from './normalize'

export function matchesQuery(w: Wine, q: string): boolean {
  const query = normalize(q)
  if (!query) return true
  const haystack = normalize(
    [w.name, w.winery, w.region, w.varietals.join(' '), w.location].join(' '),
  )
  return haystack.includes(query)
}

export function filterWines(wines: WineWithStock[], query: string): WineWithStock[] {
  if (!normalize(query)) return wines
  return wines.filter((w) => matchesQuery(w, query))
}
