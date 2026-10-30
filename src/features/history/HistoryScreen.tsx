import { useEffect, useMemo, useState } from 'react'
import { liveQuery } from 'dexie'
import type { StockEvent, WineWithStock } from '@/db/schema'
import {
  addBottles,
  consumeBottle,
  listActiveConsumptions,
  listWines,
  undoEvent,
} from '@/db/repo'
import { formatDate, formatMonth } from '@/lib/dates'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { WineDetailSheet } from '@/features/cellar/WineDetailSheet'

type Entry = { wine: WineWithStock; event: StockEvent }

export function HistoryScreen() {
  const { show } = useToast()
  const [entries, setEntries] = useState<Entry[]>([])
  const [outOfCellar, setOutOfCellar] = useState<WineWithStock[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const consumptionSub = liveQuery(listActiveConsumptions).subscribe({
      next: setEntries,
      error: () => setEntries([]),
    })
    const winesSub = liveQuery(listWines).subscribe({
      next: (wines) => setOutOfCellar(wines.filter((w) => w.stock <= 0)),
      error: () => setOutOfCellar([]),
    })
    return () => {
      consumptionSub.unsubscribe()
      winesSub.unsubscribe()
    }
  }, [])

  const months = useMemo(() => {
    const groups: Array<{ label: string; items: Entry[] }> = []
    for (const entry of entries) {
      const label = formatMonth(entry.event.at)
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.items.push(entry)
      else groups.push({ label, items: [entry] })
    }
    return groups
  }, [entries])

  const selected = outOfCellar.find((w) => w.id === selectedId) ?? null

  async function handleAdd(wine: WineWithStock) {
    try {
      const event = await addBottles(wine.id, 1)
      show('De vuelta en la cava', { label: 'Deshacer', onClick: () => void undoEvent(event.id) })
    } catch {
      show('No se pudo añadir')
    }
  }

  async function handleConsume(wine: WineWithStock) {
    try {
      const event = await consumeBottle(wine.id)
      show('Descorchada', { label: 'Deshacer', onClick: () => void undoEvent(event.id) })
    } catch {
      show('Sin stock')
    }
  }

  if (entries.length === 0 && outOfCellar.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay descorches"
        description="Cuando descorches una botella aparecerá aquí, agrupada por mes."
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {outOfCellar.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Fuera de la cava
          </h2>
          <ul className="overflow-hidden rounded-xl border border-border">
            {outOfCellar.map((wine) => (
              <li
                key={wine.id}
                className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2.5 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(wine.id)}
                  className="min-h-11 flex-1 text-left"
                >
                  <span className="block text-sm font-medium">
                    {wine.name}
                    {wine.vintage ? ` ${wine.vintage}` : ' NV'}
                  </span>
                  <span className="block text-xs text-muted">
                    {[wine.winery, wine.location].filter(Boolean).join(' · ') || 'Sin bodega'}
                  </span>
                </button>
                <Button variant="secondary" size="sm" onClick={() => void handleAdd(wine)}>
                  Volver a la cava
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {months.map((month) => (
        <section key={month.label} className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {month.label}
          </h2>
          <ul className="overflow-hidden rounded-xl border border-border">
            {month.items.map(({ wine, event }) => (
              <li
                key={event.id}
                className="flex flex-col gap-0.5 border-b border-border bg-surface px-3 py-2.5 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">
                    {wine.name}
                    {wine.vintage ? ` ${wine.vintage}` : ' NV'}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {formatDate(event.at)}
                  </span>
                </div>
                {wine.winery ? <span className="text-xs text-muted">{wine.winery}</span> : null}
                {event.note ? (
                  <span className="mt-1 text-sm text-text/80">{event.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {selected ? (
        <WineDetailSheet
          key={selected.id}
          wine={selected}
          open
          onClose={() => setSelectedId(null)}
          onAdd={() => void handleAdd(selected)}
          onConsume={() => void handleConsume(selected)}
        />
      ) : null}
    </div>
  )
}
