import { useCallback, useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import type { WineWithStock } from '@/db/schema'
import { listWines } from '@/db/repo'
import { filterWines } from '@/domain/search'

export function visibleWines(wines: WineWithStock[], query: string): WineWithStock[] {
  return filterWines(wines, query)
    .filter((w) => w.stock > 0)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function useWines(): {
  wines: WineWithStock[]
  loading: boolean
  reload: () => Promise<void>
} {
  const [wines, setWines] = useState<WineWithStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      liveQuery(listWines).subscribe({
        next: (rows) => {
          setWines(rows)
          setLoading(false)
        },
        error: (error: unknown) => {
          console.error(error)
          setLoading(false)
        },
      }).unsubscribe,
    [],
  )

  const reload = useCallback(async () => {
    setWines(await listWines())
  }, [])

  return { wines, loading, reload }
}
