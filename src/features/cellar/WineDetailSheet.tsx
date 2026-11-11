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
import { useI18n } from '@/hooks/useI18n'
import { getPairingForType } from '@/domain/foodPairing'
import type { WineType } from '@/db/schema'

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
  const { t } = useI18n()

  // Get food pairing for this wine's type
  const pairing = wine.type ? getPairingForType(wine.type as WineType) : null

  // Helper to safely access category translations
  const catLabel = (catKey: string) => {
    const catDict = t.foodPairing.categories[pairing!.type as WineType]
    return catDict?.[catKey as keyof typeof catDict] || catKey
  }
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
    show(t.wine.toast.notesSaved)
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
            {wine.vintage ?? t.wine.noVintage} · {wine.winery || t.wine.detail.noWinery} · {wine.region || t.wine.detail.noRegion}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <DrinkBadge status={drinkStatus(wine, new Date().getFullYear())} />
            <StockStepper wine={wine} onAdd={onAdd} onConsume={onConsume} />
          </div>
        </div>

        <Field label={t.wine.detail.location} hint={t.wine.detail.locationPh}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={saveLocation}
            className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3"
          />
        </Field>

        <Field label={t.wine.detail.window} hint={t.wine.detail.windowHint}>
          <div className="flex items-center gap-2">
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onBlur={saveWindow}
              inputMode="numeric"
              aria-label={t.wine.detail.from}
              className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums"
            />
            <span className="text-muted">–</span>
            <input
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              onBlur={saveWindow}
              inputMode="numeric"
              aria-label={t.wine.detail.to}
              className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums"
            />
          </div>
        </Field>

        <Field label={t.wine.detail.notes}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
          />
        </Field>

        {pairing && (
          <section className="rounded-lg border border-border bg-surface-2 p-3">
            <h3 className="mb-3 text-sm font-medium text-muted flex items-center gap-2">
              <span className="text-gold">🍽️</span>
              {t.foodPairing.title}
            </h3>
            <p className="mb-3 text-xs text-muted">{t.foodPairing.description}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {pairing.pairings.slice(0, 4).map((cat, i) => (
                <span key={i} className="px-2 py-1 rounded-full bg-surface text-xs text-muted border border-border">
                  {catLabel(cat.category)}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gold">{t.foodPairing.servingTemp}</span>
                <p className="text-muted">{pairing.servingTemp}</p>
              </div>
              <div>
                <span className="font-medium text-gold">{t.foodPairing.tip}</span>
                <p className="text-muted">{pairing.tip}</p>
              </div>
            </div>
            <details className="mt-2">
              <summary className="text-xs text-gold cursor-pointer hover:underline">
                {t.foodPairing.pairWith}…
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                {pairing.pairings.map((cat, i) => (
                  <div key={i} className="rounded bg-surface p-2">
                    <p className="font-medium text-text">
                      {catLabel(cat.category)}
                    </p>
                    <ul className="list-disc list-inside mt-1 text-muted">
                      {cat.dishes.slice(0, 6).map((dish, j) => (
                        <li key={j}>
                          {(t.foodPairing.dishes as Record<string, string>)[dish] || dish}
                        </li>
                      ))}
                      {cat.dishes.length > 6 && <li className="text-gold">+{cat.dishes.length - 6} más</li>}
                    </ul>
                  </div>
                ))}
                {pairing.avoid && pairing.avoid.length > 0 && (
                  <div className="rounded bg-surface/50 border border-wine/20 p-2">
                    <p className="font-medium text-wine">{t.foodPairing.avoid}</p>
                    <ul className="list-disc list-inside mt-1 text-muted text-xs">
                      {pairing.avoid.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          </section>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={t.wine.detail.adjustStock} hint={`Ahora: ${wine.stock}`}>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                inputMode="numeric"
                placeholder={t.wine.detail.bottles}
                className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums"
              />
            </Field>
          </div>
          <Button variant="secondary" onClick={applyStock} disabled={!target.trim()}>
            {t.wine.detail.adjust}
          </Button>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-medium text-muted">{t.wine.detail.movements}</h3>
          {events.length === 0 ? (
            <p className="text-sm text-muted">Sin movimientos.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {[...events].reverse().map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span>
                    {t.wine.detail.events[e.kind] ?? e.kind}
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
              ? `${t.wine.detail.lastUncork}: ${formatDateTime(lastConsume.at)}`
              : t.wine.detail.noUncorks}
          </span>
          {lastConsume && (
            <Button variant="ghost" size="sm" onClick={noteConsumption}>
              {t.wine.detail.addNote}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">
          {t.wine.detail.purchased} {formatDate(wine.purchasedAt ?? '') || '—'}
        </p>
      </div>
    </Sheet>
  )
}
