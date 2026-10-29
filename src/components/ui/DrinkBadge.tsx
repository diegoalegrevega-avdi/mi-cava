import { DRINK_LABEL, type DrinkStatus } from '@/domain/drinkWindow'
import { Badge } from './Badge'

export function DrinkBadge({ status }: { status: DrinkStatus }) {
  return <Badge tone={status}>{DRINK_LABEL[status]}</Badge>
}
