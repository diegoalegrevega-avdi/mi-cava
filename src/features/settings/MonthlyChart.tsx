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

  return (
    <div className="w-full" role="img" aria-label={t.monthly.ariaLabel(year)}>
      <svg
        width={chartWidth}
        height={chartHeight + 30}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
        className="w-full h-auto"
      >
        {/* Bars */}
        <g>
          {data.map((d, i) => (
            <g key={i} transform={`translate(${i * (barWidth + gap)}, 0)`}>
              <rect
                x={0}
                y={chartHeight - (d.count / Math.max(1, Math.max(...data.map(d => d.count)))) * chartHeight}
                width={barWidth}
                height={(d.count / Math.max(1, Math.max(...data.map(d => d.count)))) * chartHeight}
                fill="#7a2233"
                rx={2}
              />
              <text
                x={barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#a69c92"
                fontFamily="system-ui"
              >
                {MONTHS[i]}
              </text>
              {d.count > 0 && (
                <text
                  x={barWidth / 2}
                  y={chartHeight - (d.count / Math.max(1, Math.max(...data.map(d => d.count)))) * chartHeight - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#f2ede7"
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