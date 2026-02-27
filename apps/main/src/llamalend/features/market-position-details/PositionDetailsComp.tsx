import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import {
  useUserCollateralEvents,
  type UserCollateralEventsProps,
} from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import Stack from '@mui/material/Stack'
import { useNewPositionDetailsTabs } from '@ui-kit/hooks/useFeatureFlags'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from './BorrowPositionDetails'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'
import { NoPosition } from './NoPosition'
import { PositionDetailsTabsRow } from './PositionDetailsTabsRow'

const { Spacing } = SizesAndSpaces

export const PositionDetailsComp = ({
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
  const activityEvents = userCollateralEvents?.events ?? []
  const { value, setValue, options } = usePositionDetailsTabs({ events: activityEvents })
  const showNewBorrowPositionTabs = useNewPositionDetailsTabs()
  const detailsContent = hasPosition ? (
    <BorrowPositionDetails {...borrowPositionDetails} />
  ) : (
    <NoPosition type="borrow" />
  )

  return (
    <Stack>
      {showNewBorrowPositionTabs && <PositionDetailsTabsRow value={value} onChange={setValue} options={options} />}
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        {showNewBorrowPositionTabs ? (
          value === 'activity' ? (
            <Stack paddingInline={Spacing.md} paddingBlock={Spacing.md}>
              <UserPositionHistory
                variant="flat"
                events={activityEvents}
                isLoading={activityIsLoading}
                isError={activityIsError}
              />
            </Stack>
          ) : (
            detailsContent
          )
        ) : (
          <>
            {detailsContent}
            {activityEvents.length > 0 && (
              <Stack paddingInline={Spacing.md} paddingBlock={Spacing.md}>
                <UserPositionHistory events={activityEvents} isLoading={activityIsLoading} isError={activityIsError} />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Stack>
  )
}
