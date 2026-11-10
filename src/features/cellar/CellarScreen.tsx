import { useMemo, useState } from 'react'
import type { WineWithStock } from '@/db/schema'
import { addBottles, consumeBottle, undoEvent, seedDemoWines } from '@/db/repo'
import { useWines, visibleWines } from '@/hooks/useWines'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchBar } from './SearchBar'
import { WineDetailSheet } from './WineDetailSheet'
import { WineRow } from './WineRow'

export function CellarScreen() {
  const { wines, loading } = useWines()
  const { show } = useToast()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(() => visibleWines(wines, query), [wines, query])
  const selected = wines.find((w) => w.id === selectedId) ?? null
  const total = wines.reduce((sum, w) => sum + Math.max(w.stock, 0), 0)

  async function handleAdd(wine: WineWithStock) {
    try {
      const event = await addBottles(wine.id, 1)
      show(t.wine.toast.added.replace('{name}', wine.name), { label: t.wine.toast.undo, onClick: () => void undoEvent(event.id) })
    } catch {
      show(t.cellarScreen.loading)
    }
  }

  async function handleConsume(wine: WineWithStock) {
    try {
      const event = await consumeBottle(wine.id)
      show(t.wine.toast.consumed, { label: t.wine.toast.undo, onClick: () => void undoEvent(event.id) })
    } catch {
      show(t.wine.toast.noStock)
    }
  }

  async function handleSeedDemo() {
    try {
      await seedDemoWines()
      show(t.common.save)
    } catch {
      show(t.common.error)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <SearchBar value={query} onChange={setQuery} />
        <Button variant="secondary" onClick={() => (window.location.hash = '#/cava3d')}>
          {t.cellar.button3d}
        </Button>
      </div>

      {total >= 250 ? (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          {t.cellar.full.replace('{count}', String(total))}
        </p>
      ) : null}

      {loading ? <p className="p-3 text-sm text-muted">{t.cellarScreen.loading}</p> : null}

      {!loading && visible.length === 0 ? (
        query ? (
          <EmptyState
            title={t.cellarScreen.noResults.title}
            description={t.cellarScreen.noResults.description}
            action={<Button onClick={() => setQuery('')}>{t.cellarScreen.noResults.action}</Button>}
          />
        ) : (
          <EmptyState
            title={t.cellarScreen.empty.title}
            description={t.cellarScreen.empty.description}
            action={
              <div className="flex gap-2">
                <Button onClick={() => (window.location.hash = '#/add')}>{t.cellarScreen.empty.action}</Button>
                <Button variant="secondary" onClick={handleSeedDemo}>{t.common.save} demo</Button>
              </div>
            }
          />
        )
      ) : null}

      {visible.length > 0 ? (
        <ul className="overflow-hidden rounded-xl border border-border">
          {visible.map((wine) => (
            <WineRow
              key={wine.id}
              wine={wine}
              year={new Date().getFullYear()}
              onAdd={() => void handleAdd(wine)}
              onConsume={() => void handleConsume(wine)}
              onOpen={() => setSelectedId(wine.id)}
            />
          ))}
        </ul>
      ) : null}

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