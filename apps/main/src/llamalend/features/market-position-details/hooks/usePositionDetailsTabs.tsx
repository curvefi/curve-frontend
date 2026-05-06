import { type ReactNode, useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import type { QueryProp } from '@ui-kit/types/util'
import { BorrowPositionDetails } from '../BorrowPositionDetails'
import { NoPosition } from '../NoPosition'

export type PositionDetailsTab = 'borrowDetails' | 'activity'
type PositionDetailsTabOption = TabOption<PositionDetailsTab> & { render: () => ReactNode }

const DEFAULT_TAB: PositionDetailsTab = 'borrowDetails'

export const usePositionDetailsTabs = ({
  events: { data: events, isLoading: activityIsLoading, error: activityError },
  hasPosition,
  params: { chainId, marketId, userAddress },
  market,
}: {
  events: QueryProp<ParsedUserCollateralEvent[]>
  hasPosition: boolean | undefined
  params: UserMarketParams
  market: LlamaMarketTemplate | undefined
}) => {
  const tabOptions = useMemo<PositionDetailsTabOption[]>(
    () =>
      notFalsy(
        {
          value: DEFAULT_TAB,
          label: t`Borrow Details`,
          render: () =>
            hasPosition ? (
              <BorrowPositionDetails market={market} params={{ chainId, marketId, userAddress }} />
            ) : (
              <NoPosition type="borrow" />
            ),
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
                isError={!!activityError}
              />
            </Stack>
          ),
        },
      ),
    [events, hasPosition, market, chainId, marketId, userAddress, activityIsLoading, activityError],
  )

  const { tab = DEFAULT_TAB, onTabChange } = useTabs(tabOptions, DEFAULT_TAB)
  return { tab, onTabChange, tabOptions }
}
