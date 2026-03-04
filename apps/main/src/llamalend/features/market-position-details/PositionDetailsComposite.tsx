import { useMemo } from 'react'
import {
  useUserCollateralEvents,
  type UserCollateralEventsProps,
} from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import Stack from '@mui/material/Stack'
import { findTab } from '@ui-kit/hooks/useTabs'
import type { BorrowPositionDetailsProps } from './BorrowPositionDetails'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'
import { PositionDetailsTabsRow } from './PositionDetailsTabsRow'

export const PositionDetailsComposite = ({
  hasPosition,
  borrowPositionDetails,
  activityQueryParams,
}: {
  hasPosition: boolean | undefined
  borrowPositionDetails: BorrowPositionDetailsProps
  activityQueryParams: UserCollateralEventsProps
}) => {
  const {
    data: userCollateralEvents,
    isLoading: activityIsLoading,
    isError: activityIsError,
  } = useUserCollateralEvents(activityQueryParams)
  const activityEvents = useMemo(() => userCollateralEvents?.events ?? [], [userCollateralEvents?.events])

  const { tab, onTabChange, tabOptions } = usePositionDetailsTabs({
    events: activityEvents,
    hasPosition,
    borrowPositionDetails,
    activityIsLoading,
    activityIsError,
  })
  const activeTab = findTab(tabOptions, tab)

  return (
    <Stack>
      <PositionDetailsTabsRow tab={tab} onChange={onTabChange} options={tabOptions} />
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>{activeTab.render()}</Stack>
    </Stack>
  )
}
