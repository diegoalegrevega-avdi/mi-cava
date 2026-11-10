import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { db } from '@/db/db'
import type { EventKind } from '@/db/schema'

export function useEvents() {
  const [events, setEvents] = useState<Array<{
    id: string
    wineId: string
    delta: number
    kind: EventKind
    at: string
    undoOf?: string
  }>>([])

  useEffect(() => {
    const subscription = liveQuery(() => db.events.orderBy('at').toArray()).subscribe({
      next: (evs) => {
        setEvents(evs.map(e => ({
          id: e.id,
          wineId: e.wineId,
          delta: e.delta,
          kind: e.kind,
          at: e.at,
          undoOf: e.undoOf,
        })))
      },
      error: () => setEvents([]),
    })

    return () => subscription.unsubscribe()
  }, [])

  return { events }
}