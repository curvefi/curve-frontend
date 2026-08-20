import { type ReactNode, useEffect, useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { type TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { MarketRateType } from '@evm-ui/types/market'
import type { QueryProp } from '@evm-ui/types/util'
import { BorrowPositionDetails } from '../BorrowPositionDetails'
import { MarketEmptyPosition } from '../MarketEmptyPosition'

type PositionDetailsTab = 'borrowDetails' | 'activity'
type PositionDetailsTabOption = TabOption<PositionDetailsTab> & { render: () => ReactNode }

const DEFAULT_TAB: PositionDetailsTab = 'borrowDetails'

export const usePositionDetailsTabs = ({
  events,
  hasPosition,
}: {
  events: QueryProp<ParsedUserCollateralEvent[]>
  hasPosition: boolean | undefined
}) => {
  const tabOptions = useMemo<PositionDetailsTabOption[]>(
    () =>
      notFalsy(
        {
          value: DEFAULT_TAB,
          label: t`Your position`,
          render: () =>
            hasPosition ? <BorrowPositionDetails /> : <MarketEmptyPosition type={MarketRateType.Borrow} />,
        },
        events.data?.length && {
          value: 'activity' as const,
          label: t`Activity`,
          render: () => (
            <Stack>
              <UserPositionHistory variant="flat" eventsQuery={events} />
            </Stack>
          ),
        },
      ),
    [events, hasPosition],
  )

  const { tab = DEFAULT_TAB, onTabChange } = useTabs(tabOptions, DEFAULT_TAB)

  useEffect(() => {
    if (hasPosition === false && events.data?.length) {
      onTabChange('activity')
    }
  }, [events.data?.length, hasPosition, onTabChange])

  return { tab, onTabChange, tabOptions }
}
