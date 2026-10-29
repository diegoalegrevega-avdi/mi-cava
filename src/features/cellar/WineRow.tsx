import type { WineWithStock } from '@/db/schema'
import { drinkStatus } from '@/domain/drinkWindow'
import { DrinkBadge } from '@/components/ui/DrinkBadge'
import { StockStepper } from './StockStepper'

export function WineRow({
  wine,
  year,
  onAdd,
  onConsume,
  onOpen,
}: {
  wine: WineWithStock
  year: number
  onAdd: () => void
  onConsume: () => void
  onOpen?: () => void
}) {
  const meta = [wine.winery, wine.region].filter(Boolean).join(' · ')

  return (
    <li className="flex items-center gap-3 border-b border-border bg-surface px-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-medium text-text">{wine.name}</span>
          <span className="text-sm tabular-nums text-muted">{wine.vintage ?? 'NV'}</span>
        </div>
        {meta ? <p className="truncate text-sm text-muted">{meta}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <DrinkBadge status={drinkStatus(wine, year)} />
          {wine.location ? <span className="text-xs text-muted">{wine.location}</span> : null}
        </div>
      </div>
      <StockStepper wine={wine} onAdd={onAdd} onConsume={onConsume} onOpen={onOpen} />
    </li>
  )
}
