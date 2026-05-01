import { type ReactNode, useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from '../BorrowPositionDetails'
import { NoPosition } from '../NoPosition'

export type PositionDetailsTab = 'borrowDetails' | 'activity'
type PositionDetailsTabOption = TabOption<PositionDetailsTab> & { render: () => ReactNode }

const DEFAULT_TAB: PositionDetailsTab = 'borrowDetails'

export const usePositionDetailsTabs = ({
  events,
  hasPosition,
  borrowPositionDetails,
  activityIsLoading,
  activityIsError,
}: {
  events: ParsedUserCollateralEvent[] | undefined
  hasPosition: boolean | undefined
  borrowPositionDetails: BorrowPositionDetailsProps
  activityIsLoading: boolean
  activityIsError: boolean
}) => {
  const tabOptions = useMemo<PositionDetailsTabOption[]>(
    () =>
      notFalsy(
        {
          value: DEFAULT_TAB,
          label: t`Borrow Details`,
          render: () =>
            hasPosition ? <BorrowPositionDetails {...borrowPositionDetails} /> : <NoPosition type="borrow" />,
        },
        events?.length && {
          value: 'activity' as const,
          label: t`Activity`,
          render: () => (
            <Stack>
              <UserPositionHistory
                variant="flat"
                events={events}
                isLoading={activityIsLoading}
                isError={activityIsError}
              />
            </Stack>
          ),
        },
      ),
    [hasPosition, borrowPositionDetails, events, activityIsLoading, activityIsError],
  )

  const { tab = DEFAULT_TAB, onTabChange } = useTabs(tabOptions, DEFAULT_TAB)
  return { tab, onTabChange, tabOptions }
}
