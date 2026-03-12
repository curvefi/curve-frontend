import { type ReactNode, useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import Stack from '@mui/material/Stack'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from '../BorrowPositionDetails'

const { Spacing } = SizesAndSpaces

export type PositionDetailsTab = 'borrowDetails' | 'activity'
type PositionDetailsTabOption = TabOption<PositionDetailsTab> & { render: () => ReactNode }

export const usePositionDetailsTabs = ({
  events,
  hasPosition,
  borrowPositionDetails,
  activityIsLoading,
  activityIsError,
}: {
  events: ParsedUserCollateralEvent[]
  hasPosition: boolean | undefined
  borrowPositionDetails: BorrowPositionDetailsProps
  activityIsLoading: boolean
  activityIsError: boolean
}) => {
  const hasActivity = events.length > 0

  const tabOptions = useMemo<PositionDetailsTabOption[]>(
    () => [
      ...(hasPosition
        ? [
            {
              value: 'borrowDetails' as const,
              label: t`Borrow Details`,
              render: () => <BorrowPositionDetails {...borrowPositionDetails} />,
            },
          ]
        : []),
      ...(hasActivity
        ? [
            {
              value: 'activity' as const,
              label: t`Activity`,
              render: () => (
                <Stack paddingInline={Spacing.md} paddingBlock={Spacing.md}>
                  <UserPositionHistory
                    variant="flat"
                    events={events}
                    isLoading={activityIsLoading}
                    isError={activityIsError}
                  />
                </Stack>
              ),
            },
          ]
        : []),
    ],
    [hasActivity, hasPosition, borrowPositionDetails, events, activityIsLoading, activityIsError],
  )

  const { tab, onTabChange } = useTabs(tabOptions)
  return { tab, onTabChange, tabOptions }
}
