import { StatsSection } from '@/features/settings/StatsSection'
import { useEvents } from '@/hooks/useEvents'
import { useWines } from '@/hooks/useWines'

export function StatsScreen() {
  const { wines } = useWines()
  const { events } = useEvents()

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <StatsSection wines={wines} events={events} />
    </section>
  )
}
