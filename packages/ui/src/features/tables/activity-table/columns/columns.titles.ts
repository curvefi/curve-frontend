import { t } from '@ui/lib/i18n'
import { ActivityColumnId } from './columns.enum'

export const ACTIVITY_TITLES: Record<ActivityColumnId, string> = {
  [ActivityColumnId.Time]: t`Time`,
  [ActivityColumnId.Action]: t`Action`,
  [ActivityColumnId.Value]: t`Value`,
  [ActivityColumnId.Amount]: t`Amount`,
  [ActivityColumnId.Address]: t`Address`,
}
