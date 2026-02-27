import { useMemo, useState } from 'react'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'

export type PositionDetailsTab = 'borrowDetails' | 'activity'

type UsePositionDetailsTabsArgs = {
  events?: ParsedUserCollateralEvent[]
}

export const usePositionDetailsTabs = ({ events }: UsePositionDetailsTabsArgs) => {
  const hasActivity = (events?.length ?? 0) > 0
  const [requestedValue, setRequestedValue] = useState<PositionDetailsTab>('borrowDetails')
  const value = !hasActivity && requestedValue === 'activity' ? 'borrowDetails' : requestedValue

  const options = useMemo<TabOption<PositionDetailsTab>[]>(
    () => [
      { value: 'borrowDetails', label: t`Borrow Details` },
      ...(hasActivity ? [{ value: 'activity' as const, label: t`Activity` }] : []),
    ],
    [hasActivity],
  )

  return { value, setValue: setRequestedValue, options }
}
