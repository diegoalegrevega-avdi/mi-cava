import { useState } from 'react'
import type { WineWithStock } from '@/db/schema'
import type { CaveConfig } from '@/domain/caveLayout'
import { addBottles, consumeBottle, undoEvent } from '@/db/repo'
import { useWines } from '@/hooks/useWines'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/Button'
import { Cave3D } from './Cave3D'
import { WineDetailSheet } from './WineDetailSheet'

const DEFAULT_CONFIG: CaveConfig = { depth: 8, width: 1, shelves: 3, fill: 'wine' }

function readConfig(): CaveConfig {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem('micava.cave') ?? '{}') }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function Cave3DScreen() {
  const { wines } = useWines()
  const { show } = useToast()
  const { t } = useI18n()
  const [config] = useState(readConfig)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = wines.find((w) => w.id === selectedId) ?? null

  async function handleAdd(wine: WineWithStock) {
    try {
      const event = await addBottles(wine.id, 1)
      show(t.wine.toast.added.replace('{name}', wine.name), {
        label: t.wine.toast.undo,
        onClick: () => void undoEvent(event.id),
      })
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

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-serif text-xl">{t.cave3dScreen.title}</h2>
        <Button variant="secondary" onClick={() => (window.location.hash = '#/cava')}>
          {t.cave3dScreen.back}
        </Button>
      </div>

      <Cave3D wines={wines} config={config} onOpen={(wine) => setSelectedId(wine.id)} />

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
