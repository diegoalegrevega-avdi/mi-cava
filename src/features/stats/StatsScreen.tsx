import { StatsSection } from '@/features/settings/StatsSection'
import { useEvents } from '@/hooks/useEvents'
import { useWines } from '@/hooks/useWines'

export function StatsScreen() {
  const { wines } = useWines()
  const { events } = useEvents()

  return <StatsSection wines={wines} events={events} />
}
