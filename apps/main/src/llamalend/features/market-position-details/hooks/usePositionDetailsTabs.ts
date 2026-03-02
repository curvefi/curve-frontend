import { useMemo } from 'react'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'

export type PositionDetailsTab = 'borrowDetails' | 'activity'

export const usePositionDetailsTabs = ({ events }: { events?: ParsedUserCollateralEvent[] }) => {
  const hasActivity = (events?.length ?? 0) > 0

  const positionDetailsTabOptions = useMemo<TabOption<PositionDetailsTab>[]>(
    () => [
      { value: 'borrowDetails', label: t`Borrow Details` },
      ...(hasActivity ? [{ value: 'activity' as const, label: t`Activity` }] : []),
    ],
    [hasActivity],
  )

  const { tab = 'borrowDetails', onTabChange, tabOptions } = useTabs(positionDetailsTabOptions, 'borrowDetails')
  return { tab, onTabChange, tabOptions }
}
