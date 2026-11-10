import type { WineWithStock } from '@/db/schema'
import { computeStats } from '@/domain/stats'
import { donutSegments } from '@/domain/donut'
import { DRINK_LABEL } from '@/domain/drinkWindow'
import { formatEuros } from '@/lib/money'
import { MonthlyChart } from './MonthlyChart'
import { useMemo } from 'react'
import type { StockEvent } from '@/db/schema'

interface StatsSectionProps {
  wines: WineWithStock[]
  events: StockEvent[]
}

export function StatsSection({ wines, events }: StatsSectionProps) {
  const stats = useMemo(() => computeStats(wines, new Date().getFullYear()), [wines])

  // Donut data
  const typeCounts: Record<string, number> = {}
  for (const [type, count] of Object.entries(stats.byType)) {
    typeCounts[type] = count
  }
  const donut = donutSegments(typeCounts)

  // Apogeo counts
  const apogeo = {
    ready: stats.ready,
    keep: stats.keep,
    past: stats.past,
    unknown: stats.unknown,
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-4 font-serif text-xl">Estadísticas</h2>

      {/* Four figures */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Figure label="Botellas" value={stats.bottles} />
        <Figure label="Referencias" value={stats.references} />
        <Figure label="Valor estimado" value={formatEuros(stats.valueCents)} />
        <Figure label="Última exportación" value="—" />
      </div>

      {/* Donut + Apogeo */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Donut */}
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <h3 className="mb-3 font-medium text-center">Distribución por tipo</h3>
          <div className="relative h-48 w-full max-w-xs mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {donut.map((seg, i) => (
                <path
                  key={i}
                  d={`M 50 50 L 50 0 A 50 50 0 ${seg.percent > 50 ? 1 : 0} 1 ${50 + 50 * Math.cos((seg.endAngle - 90) * Math.PI / 180)} ${50 + 50 * Math.sin((seg.endAngle - 90) * Math.PI / 180)} Z`}
                  fill={seg.color}
                />
              ))}
              <circle cx="50" cy="50" r="30" fill="#191614" />
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
            {donut.map((seg) => (
              <div key={seg.type} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded" style={{ backgroundColor: seg.color }} />
                <span className="text-muted">{seg.type === 'sinTipo' ? 'Sin tipo' : seg.type}</span>
                <span>{seg.count} ({seg.percent}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Apogeo cards */}
        <div className="space-y-2">
          <h3 className="font-medium">Apogeo</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'ready', label: DRINK_LABEL.ready, color: '#4b8a5c' },
              { key: 'keep', label: DRINK_LABEL.keep, color: '#c2a369' },
              { key: 'past', label: DRINK_LABEL.past, color: '#c0453f' },
              { key: 'unknown', label: DRINK_LABEL.unknown, color: '#6b625a' },
            ].map(({ key, label, color }) => (
              <div
                key={key}
                className="rounded-lg border border-border bg-surface-2 p-3 text-center"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="text-2xl font-bold text-text">{apogeo[key as keyof typeof apogeo]}</div>
                <div className="text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div>
        <h3 className="mb-3 font-medium">Evolución mensual de descorches</h3>
        <MonthlyChart events={events} year={new Date().getFullYear()} />
      </div>
    </section>
  )
}

function Figure({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  )
}