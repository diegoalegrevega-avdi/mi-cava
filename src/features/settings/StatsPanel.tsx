import type { WineType, WineWithStock } from '@/db/schema'
import { computeStats } from '@/domain/stats'

const STATUS = [
  { key: 'ready', label: 'Listos', bar: 'bg-[#4b8a5c]' },
  { key: 'keep', label: 'Para guardar', bar: 'bg-gold' },
  { key: 'past', label: 'Pasados', bar: 'bg-[#c0453f]' },
  { key: 'unknown', label: 'Sin ventana', bar: 'bg-muted' },
] as const

const TYPE_LABEL: Record<WineType | 'sinTipo', string> = {
  tinto: 'Tinto',
  blanco: 'Blanco',
  rosado: 'Rosado',
  espumoso: 'Espumoso',
  dulce: 'Dulce',
  fortificado: 'Fortificado',
  sinTipo: 'Sin tipo',
}

export function StatsPanel({ wines }: { wines: WineWithStock[] }) {
  const stats = computeStats(wines, new Date().getFullYear())
  const percent = (n: number) => (stats.bottles > 0 ? Math.round((n / stats.bottles) * 100) : 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm text-muted">Por momento de consumo</p>
        <ul className="flex flex-col gap-2">
          {STATUS.map(({ key, label, bar }) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className={bar} style={{ width: `${percent(stats[key])}%`, height: '100%' }} />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums">{stats[key]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-sm text-muted">Por tipo</p>
        <ul className="flex flex-col gap-2">
          {Object.entries(stats.byType)
            .filter(([, n]) => n > 0)
            .map(([type, n]) => (
              <li key={type} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 text-muted">{TYPE_LABEL[type as WineType | 'sinTipo']}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="bg-wine" style={{ width: `${percent(n)}%`, height: '100%' }} />
                </div>
                <span className="w-8 shrink-0 text-right tabular-nums">{n}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
