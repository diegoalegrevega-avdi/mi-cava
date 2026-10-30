import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import type { WineWithStock } from '@/db/schema'
import { adjustStock, listEvents, setEventNote, updateWine } from '@/db/repo'
import { lastConsumption } from '@/domain/journal'
import { Sheet } from '@/components/ui/Sheet'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { DrinkBadge } from '@/components/ui/DrinkBadge'
import { StockStepper } from './StockStepper'
import { drinkStatus } from '@/domain/drinkWindow'
import { formatDate, formatDateTime } from '@/lib/dates'
import { useToast } from '@/hooks/useToast'

const EVENT_LABEL: Record<string, string> = {
  add: 'Botella añadida',
  consume: 'Descorchada',
  import: 'Ajuste de stock',
  undo: 'Deshecho',
}

export function WineDetailSheet({
  wine,
  open,
  onClose,
  onAdd,
  onConsume,
}: {
  wine: WineWithStock
  open: boolean
  onClose: () => void
  onAdd: () => void
  onConsume: () => void
}) {
  const { show } = useToast()
  const [notes, setNotes] = useState(wine.notes)
  const [location, setLocation] = useState(wine.location)
  const [from, setFrom] = useState(wine.drinkFrom?.toString() ?? '')
  const [until, setUntil] = useState(wine.drinkUntil?.toString() ?? '')
  const [target, setTarget] = useState('')
  const [events, setEvents] = useState<Awaited<ReturnType<typeof listEvents>>>([])

  useEffect(() => {
    const sub = liveQuery(() => listEvents(wine.id)).subscribe({ next: setEvents, error: console.error })
    return () => sub.unsubscribe()
  }, [wine.id])

  const lastConsume = lastConsumption(events)

  async function saveNotes() {
    if (notes === wine.notes) return
    await updateWine(wine.id, { notes })
    show('Notas guardadas')
  }

  async function saveLocation() {
    if (location === wine.location) return
    await updateWine(wine.id, { location })
  }

  async function saveWindow() {
    const nextFrom = Number.parseInt(from, 10)
    const nextUntil = Number.parseInt(until, 10)
    const patch = {
      drinkFrom: Number.isFinite(nextFrom) ? nextFrom : null,
      drinkUntil: Number.isFinite(nextUntil) ? nextUntil : null,
    }
    if (patch.drinkFrom === wine.drinkFrom && patch.drinkUntil === wine.drinkUntil) return
    await updateWine(wine.id, patch)
  }

  async function applyStock() {
    const value = Number.parseInt(target, 10)
    if (!Number.isFinite(value) || value < 0) return
    const event = await adjustStock(wine.id, value)
    setTarget('')
    if (event) show(`${wine.name}: ${value} botellas`)
  }

  async function noteConsumption() {
    if (!lastConsume) return
    const note = window.prompt('Nota del descorche')
    if (!note) return
    await setEventNote(lastConsume.id, note)
  }

  return (
    <Sheet open={open} onClose={onClose} title={wine.name}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted">
            {wine.vintage ?? 'NV'} · {wine.winery || 'Sin bodega'} · {wine.region || 'Sin región'}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <DrinkBadge status={drinkStatus(wine, new Date().getFullYear())} />
            <StockStepper wine={wine} onAdd={onAdd} onConsume={onConsume} />
          </div>
        </div>

        <Field label="Ubicación">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={saveLocation}
            placeholder="Estante, balda…"
            className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3"
          />
        </Field>

        <Field label="Ventana de consumo" hint="Años desde y hasta">
          <div className="flex items-center gap-2">
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onBlur={saveWindow}
              inputMode="numeric"
              aria-label="Año desde"
              className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums"
            />
            <span className="text-muted">–</span>
            <input
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              onBlur={saveWindow}
              inputMode="numeric"
              aria-label="Año hasta"
              className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums"
            />
          </div>
        </Field>

        <Field label="Notas de cata y maridaje">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
          />
        </Field>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Ajustar stock" hint={`Ahora: ${wine.stock}`}>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                inputMode="numeric"
                placeholder="Botellas reales"
                className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums"
              />
            </Field>
          </div>
          <Button variant="secondary" onClick={applyStock} disabled={!target.trim()}>
            Ajustar
          </Button>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-medium text-muted">Movimientos</h3>
          {events.length === 0 ? (
            <p className="text-sm text-muted">Sin movimientos.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {[...events].reverse().map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span>
                    {EVENT_LABEL[e.kind] ?? e.kind}
                    {e.note ? ` · ${e.note}` : ''}
                  </span>
                  <span className="shrink-0 text-muted tabular-nums">{formatDate(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {lastConsume
              ? `Último descorche: ${formatDateTime(lastConsume.at)}`
              : 'Aún sin descorches'}
          </span>
          {lastConsume && (
            <Button variant="ghost" size="sm" onClick={noteConsumption}>
              Añadir nota al último descorche
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">
          Comprado el {formatDate(wine.purchasedAt ?? '') || '—'}
        </p>
      </div>
    </Sheet>
  )
}
