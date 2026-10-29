import { cn } from '@/lib/cn'
import { NAV_ITEMS, type NavId } from '@/nav'
import { NavIcon } from '@/components/ui/Icons'

export function SideBar({ active, className }: { active: NavId; className?: string }) {
  return (
    <nav
      aria-label="Secciones"
      className={cn('sticky top-0 h-dvh w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-3', className)}
    >
      <p className="px-3 py-4 font-serif text-xl text-text">Mi Cava</p>
      {NAV_ITEMS.map((item) => {
        const on = item.id === active
        return (
          <a
            key={item.id}
            href={item.hash}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition',
              on ? 'bg-surface-2 text-gold' : 'text-muted hover:bg-surface-2 hover:text-text',
            )}
          >
            <NavIcon id={item.id} className="size-5" />
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
