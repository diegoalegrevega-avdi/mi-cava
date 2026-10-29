import { IconButton } from '@/components/ui/IconButton'

export function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, bodega, región…"
        autoComplete="off"
        aria-label="Buscar en la cava"
        className="min-h-11 w-full rounded-xl border border-border bg-surface px-4 pr-12 text-text placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      />
      {value ? (
        <IconButton
          label="Borrar búsqueda"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          ×
        </IconButton>
      ) : null}
    </div>
  )
}
