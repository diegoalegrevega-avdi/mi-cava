import { useMemo, useState } from 'react'
import type { WineWithStock } from '@/db/schema'
import { addBottles, consumeBottle, undoEvent } from '@/db/repo'
import { useWines, visibleWines } from '@/hooks/useWines'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchBar } from './SearchBar'
import { WineDetailSheet } from './WineDetailSheet'
import { WineRow } from './WineRow'

export function CellarScreen() {
  const { wines, loading } = useWines()
  const { show } = useToast()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(() => visibleWines(wines, query), [wines, query])
  const selected = wines.find((w) => w.id === selectedId) ?? null
  const total = wines.reduce((sum, w) => sum + Math.max(w.stock, 0), 0)
  const year = new Date().getFullYear()

  async function handleAdd(wine: WineWithStock) {
    try {
      const event = await addBottles(wine.id, 1)
      show('Botella añadida', { label: 'Deshacer', onClick: () => void undoEvent(event.id) })
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

  return (
    <div className="flex w-full flex-col gap-3">
      <SearchBar value={query} onChange={setQuery} />

      {total >= 250 ? (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          Cava llena · {total} botellas
        </p>
      ) : null}

      {loading ? <p className="p-3 text-sm text-muted">Cargando…</p> : null}

      {!loading && visible.length === 0 ? (
        query ? (
          <EmptyState
            title="Nada coincide"
            description="Prueba con otro nombre, bodega o región."
            action={<Button onClick={() => setQuery('')}>Borrar búsqueda</Button>}
          />
        ) : (
          <EmptyState
            title="Tu cava está vacía"
            description="Añade tu primera botella y empieza a llevar la cuenta."
            action={
              <Button onClick={() => (window.location.hash = '#/add')}>Añadir vino</Button>
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
              year={year}
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
