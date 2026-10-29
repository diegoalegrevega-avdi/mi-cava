import type { WineWithStock } from '@/db/schema'
import { IconButton } from '@/components/ui/IconButton'

export function StockStepper({
  wine,
  onAdd,
  onConsume,
}: {
  wine: WineWithStock
  onAdd: () => void
  onConsume: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <IconButton
        label={`Descorchar ${wine.name}`}
        onClick={onConsume}
        disabled={wine.stock <= 0}
        className="border border-border"
      >
        −
      </IconButton>
      <span className="min-w-8 text-center tabular-nums">{wine.stock}</span>
      <IconButton label={`Añadir botella de ${wine.name}`} onClick={onAdd} className="border border-border">
        +
      </IconButton>
    </div>
  )
}
