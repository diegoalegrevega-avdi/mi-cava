import type { DrinkStatus } from '@/domain/drinkWindow'
import { useI18n } from '@/hooks/useI18n'
import { Badge } from './Badge'

export function DrinkBadge({ status }: { status: DrinkStatus }) {
  const { t } = useI18n()
  return <Badge tone={status}>{t.drink[status]}</Badge>
}
