import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'

const CONFIG_KEY = 'micava.cave'

export interface CaveConfig {
  depth: number
  width: number
  shelves: number
  fill: 'wine' | 'type'
}

const DEFAULT_CONFIG: CaveConfig = {
  depth: 8,
  width: 1,
  shelves: 3,
  fill: 'wine',
}

export function CaveConfigPanel() {
  const [config, setConfig] = useState<CaveConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG
    try {
      const stored = localStorage.getItem(CONFIG_KEY)
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  const capacity = config.depth * config.width * config.shelves
  const overCapacity = capacity > 320

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  }, [config])

  function update<K extends keyof CaveConfig>(key: K, value: CaveConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  function increment(key: 'depth' | 'width' | 'shelves', min: number, max: number) {
    setConfig(prev => {
      const newVal = Math.min(max, Math.max(min, prev[key] + 1))
      return { ...prev, [key]: newVal }
    })
  }

  function decrement(key: 'depth' | 'width' | 'shelves', min: number) {
    setConfig(prev => {
      const newVal = Math.max(min, prev[key] - 1)
      return { ...prev, [key]: newVal }
    })
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 font-serif text-xl">Cava 3D</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Profundidad (botellas)">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => decrement('depth', 1)}>−</Button>
            <span className="w-12 text-center text-lg tabular-nums">{config.depth}</span>
            <Button variant="ghost" size="sm" onClick={() => increment('depth', 1, 20)}>+</Button>
          </div>
          <p className="text-xs text-muted mt-1">Filas de fondo (1-20)</p>
        </Field>

        <Field label="Ancho (botellas)">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => decrement('width', 1)}>−</Button>
            <span className="w-12 text-center text-lg tabular-nums">{config.width}</span>
            <Button variant="ghost" size="sm" onClick={() => increment('width', 1, 4)}>+</Button>
          </div>
          <p className="text-xs text-muted mt-1">Botellas por fila (1-4)</p>
        </Field>

        <Field label="Pisos">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => decrement('shelves', 1)}>−</Button>
            <span className="w-12 text-center text-lg tabular-nums">{config.shelves}</span>
            <Button variant="ghost" size="sm" onClick={() => increment('shelves', 1, 8)}>+</Button>
          </div>
          <p className="text-xs text-muted mt-1">Altura en pisos (1-8)</p>
        </Field>

        <Field label="Modo de relleno">
          <select
            value={config.fill}
            onChange={e => update('fill', e.target.value as 'wine' | 'type')}
            className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-text"
          >
            <option value="wine">Por vino (agrupa cada vino junto)</option>
            <option value="type">Por tipo (agrupa por color)</option>
          </select>
          <p className="text-xs text-muted mt-1">
            {config.fill === 'wine' ? 'Agrupa botellas del mismo vino en celdas contiguas' : 'Agrupa por tipo: tinto, blanco, rosado...'}
          </p>
        </Field>
      </div>

      <div className={`mt-4 p-3 rounded-lg ${overCapacity ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-surface-2'}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">Capacidad total: {config.depth * config.width * config.shelves} botellas</span>
          {overCapacity && (
            <span className="text-sm">⚠ Supera 320 (se recortará visualmente)</span>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        Los cambios se guardan automáticamente. La vista 3D se actualiza al instante.
      </p>
    </section>
  )
}