import type { WineWithStock } from '@/db/schema'
import { computeStats } from '@/domain/stats'
import { donutSegments, donutPath, DONUT_RADIUS } from '@/domain/donut'
import { formatEuros } from '@/lib/money'
import { MonthlyChart } from './MonthlyChart'
import { useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'
import type { StockEvent } from '@/db/schema'

interface StatsSectionProps {
  wines: WineWithStock[]
  events: StockEvent[]
}

export function StatsSection({ wines, events }: StatsSectionProps) {
  const { t } = useI18n()
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
      {/* Four figures */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Figure label={t.settings.stats.bottles} value={stats.bottles} />
        <Figure label={t.settings.stats.references} value={stats.references} />
        <Figure label={t.settings.stats.value} value={formatEuros(stats.valueCents)} />
        <Figure label={t.settings.stats.lastExport} value="—" />
      </div>

      {/* Donut + Apogeo */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Donut */}
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <h3 className="mb-3 font-medium text-center">{t.stats.distributionTitle}</h3>
          <div className="relative h-48 w-full max-w-xs mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {donut.length === 1 ? (
                <circle cx="50" cy="50" r={DONUT_RADIUS} fill={donut[0]!.color} />
              ) : (
                donut.map((seg) => (
                  <path
                    key={seg.type}
                    d={donutPath(seg.startAngle, seg.endAngle)}
                    fill={seg.color}
                    stroke="var(--surface-2)"
                    strokeWidth={1.5}
                  />
                ))
              )}
              <circle cx="50" cy="50" r="30" fill="var(--surface-2)" />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="16"
                fontWeight="600"
                fill="var(--text)"
                fontFamily="system-ui"
              >
                {stats.bottles}
              </text>
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
            {donut.map((seg) => (
              <div key={seg.type} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded" style={{ backgroundColor: seg.color }} />
                <span className="text-muted">{t.types[seg.type]}</span>
                <span>{seg.count} ({seg.percent}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Apogeo cards */}
        <div className="space-y-2">
          <h3 className="font-medium">{t.settings.stats.apogeo}</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'ready', label: t.drink.ready, color: '#4b8a5c' },
              { key: 'keep', label: t.drink.keep, color: '#c2a369' },
              { key: 'past', label: t.drink.past, color: '#c0453f' },
              { key: 'unknown', label: t.drink.unknown, color: '#6b625a' },
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
        <h3 className="mb-3 font-medium">{t.stats.evolutionTitle}</h3>
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