import type { WineWithStock } from '@/db/schema'
import { IconButton } from '@/components/ui/IconButton'

export function StockStepper({
  wine,
  onAdd,
  onConsume,
  onOpen,
}: {
  wine: WineWithStock
  onAdd: () => void
  onConsume: () => void
  onOpen?: () => void
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
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver ficha de ${wine.name}`}
          className="min-h-11 min-w-11 rounded-lg px-1 text-center tabular-nums hover:bg-surface-2"
        >
          {wine.stock}
        </button>
      ) : (
        <span className="min-w-8 text-center tabular-nums">{wine.stock}</span>
      )}
      <IconButton label={`Añadir botella de ${wine.name}`} onClick={onAdd} className="border border-border">
        +
      </IconButton>
    </div>
  )
}
