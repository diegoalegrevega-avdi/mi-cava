import type { WineWithStock } from '@/db/schema'
import { IconButton } from '@/components/ui/IconButton'
import { useI18n } from '@/hooks/useI18n'

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
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-1">
      <IconButton
        label={t.wine.consume.replace('{name}', wine.name)}
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
          aria-label={t.wine.openDetail.replace('{name}', wine.name)}
          className="min-h-11 min-w-11 rounded-lg px-1 text-center tabular-nums hover:bg-surface-2"
        >
          {wine.stock}
        </button>
      ) : (
        <span className="min-w-8 text-center tabular-nums">{wine.stock}</span>
      )}
      <IconButton label={t.wine.add.replace('{name}', wine.name)} onClick={onAdd} className="border border-border">
        +
      </IconButton>
    </div>
  )
}
