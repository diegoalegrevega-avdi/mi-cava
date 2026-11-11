import { IconButton } from '@/components/ui/IconButton'
import { useI18n } from '@/hooks/useI18n'

export function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useI18n()
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.cellar.search}
        autoComplete="off"
        aria-label={t.cellar.search}
        className="min-h-11 w-full rounded-xl border border-border bg-surface px-4 pr-12 text-text placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      />
      {value ? (
        <IconButton
          label={t.cellar.noResults.action}
          onClick={() => onChange('')}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          ×
        </IconButton>
      ) : null}
    </div>
  )
}
