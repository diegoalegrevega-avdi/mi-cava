import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { useI18n } from '@/hooks/useI18n'

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
  const { t } = useI18n()
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
      <h2 className="mb-3 font-serif text-xl">{t.settings.cave3d.title}</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label={t.caveConfig.depth}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => decrement('depth', 1)}>−</Button>
            <span className="w-12 text-center text-lg tabular-nums">{config.depth}</span>
            <Button variant="ghost" size="sm" onClick={() => increment('depth', 1, 20)}>+</Button>
          </div>
          <p className="text-xs text-muted mt-1">{t.caveConfig.depthHint}</p>
        </Field>

        <Field label={t.caveConfig.width}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => decrement('width', 1)}>−</Button>
            <span className="w-12 text-center text-lg tabular-nums">{config.width}</span>
            <Button variant="ghost" size="sm" onClick={() => increment('width', 1, 4)}>+</Button>
          </div>
          <p className="text-xs text-muted mt-1">{t.caveConfig.widthHint}</p>
        </Field>

        <Field label={t.caveConfig.shelves}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => decrement('shelves', 1)}>−</Button>
            <span className="w-12 text-center text-lg tabular-nums">{config.shelves}</span>
            <Button variant="ghost" size="sm" onClick={() => increment('shelves', 1, 8)}>+</Button>
          </div>
          <p className="text-xs text-muted mt-1">{t.caveConfig.shelvesHint}</p>
        </Field>

        <Field label={t.caveConfig.fill}>
          <select
            value={config.fill}
            onChange={e => update('fill', e.target.value as 'wine' | 'type')}
            className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-text"
          >
            <option value="wine">{t.caveConfig.fillWine}</option>
            <option value="type">{t.caveConfig.fillType}</option>
          </select>
          <p className="text-xs text-muted mt-1">
            {config.fill === 'wine' ? t.caveConfig.fillWineHint : t.caveConfig.fillTypeHint}
          </p>
        </Field>
      </div>

      <div className={`mt-4 p-3 rounded-lg ${overCapacity ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-surface-2'}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">{t.caveConfig.capacity.replace('{count}', String(config.depth * config.width * config.shelves))}</span>
          {overCapacity && (
            <span className="text-sm">{t.caveConfig.overCapacity}</span>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {t.caveConfig.autoSave}
      </p>
    </section>
  )
}