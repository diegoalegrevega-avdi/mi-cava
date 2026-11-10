import { monthlyConsumptions } from '@/domain/monthly'
import type { StockEvent } from '@/db/schema'
import { useI18n } from '@/hooks/useI18n'

interface MonthlyChartProps {
  events: StockEvent[]
  year: number
}

export function MonthlyChart({ events, year }: MonthlyChartProps) {
  const { t } = useI18n()
  const data = monthlyConsumptions(events, year)
  const MONTHS = t.monthly.months
  const barWidth = 30
  const gap = 8
  const chartHeight = 80
  const chartWidth = 12 * (30 + 8)
  const max = Math.max(1, ...data.map((d) => d.count))
  // Leave headroom so the tallest bar still shows its count label.
  const barHeight = (count: number) => (count / max) * chartHeight * 0.85

  return (
    <div className="w-full" role="img" aria-label={t.monthly.ariaLabel(year)}>
      <svg
        width={chartWidth}
        height={chartHeight + 30}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8f1030" />
            <stop offset="100%" stopColor="#e0466f" />
          </linearGradient>
        </defs>
        {/* Bars */}
        <g>
          {data.map((d, i) => (
            <g key={i} transform={`translate(${i * (barWidth + gap)}, 0)`}>
              <rect
                x={0}
                y={chartHeight - barHeight(d.count)}
                width={barWidth}
                height={barHeight(d.count)}
                fill="url(#barGradient)"
                rx={3}
              />
              <text
                x={barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted)"
                fontFamily="system-ui"
              >
                {MONTHS[i]}
              </text>
              {d.count > 0 && (
                <text
                  x={barWidth / 2}
                  y={chartHeight - barHeight(d.count) - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--text)"
                  fontFamily="system-ui"
                >
                  {d.count}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
      <p className="text-xs text-muted text-center mt-1">
        {t.monthly.total(data.reduce((a, b) => a + b.count, 0), year)}
      </p>
    </div>
  )
}
