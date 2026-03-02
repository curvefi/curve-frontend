import { useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import {
  useUserCollateralEvents,
  type UserCollateralEventsProps,
} from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import Stack from '@mui/material/Stack'
import { useNewPositionDetailsTabs } from '@ui-kit/hooks/useFeatureFlags'
import { findTab } from '@ui-kit/hooks/useTabs'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from './BorrowPositionDetails'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'
import { NoPosition } from './NoPosition'
import { PositionDetailsTabsRow } from './PositionDetailsTabsRow'

const { Spacing } = SizesAndSpaces

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
  const showNewBorrowPositionTabs = useNewPositionDetailsTabs()

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
      {showNewBorrowPositionTabs && <PositionDetailsTabsRow tab={tab} onChange={onTabChange} options={tabOptions} />}
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        {showNewBorrowPositionTabs ? (
          activeTab.render()
        ) : (
          <>
            {hasPosition ? <BorrowPositionDetails {...borrowPositionDetails} /> : <NoPosition type="borrow" />}
            {activityEvents.length > 0 && (
              <Stack paddingInline={Spacing.md} paddingBlock={Spacing.md}>
                <UserPositionHistory
                  variant="accordion"
                  events={activityEvents}
                  isLoading={activityIsLoading}
                  isError={activityIsError}
                />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Stack>
  )
}
