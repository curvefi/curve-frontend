import { type ReactNode, useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { MarketRateType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { BorrowPositionDetails } from '../BorrowPositionDetails'
import { MarketEmptyPosition } from '../MarketEmptyPosition'

export type PositionDetailsTab = 'borrowDetails' | 'activity'
type PositionDetailsTabOption = TabOption<PositionDetailsTab> & { render: () => ReactNode }

const DEFAULT_TAB: PositionDetailsTab = 'borrowDetails'

export const usePositionDetailsTabs = ({
  events,
  hasPosition,
  params: { chainId, marketId, userAddress },
  tokens,
}: {
  events: QueryProp<ParsedUserCollateralEvent[]>
  hasPosition: boolean | undefined
  params: UserMarketParams
  tokens: MarketTokensOrEmpty
}) => {
  const tabOptions = useMemo<PositionDetailsTabOption[]>(
    () =>
      notFalsy(
        {
          value: DEFAULT_TAB,
          label: t`Borrow Details`,
          render: () =>
            hasPosition ? (
              <BorrowPositionDetails tokens={tokens} params={{ chainId, marketId, userAddress }} />
            ) : (
              <MarketEmptyPosition type={userAddress ? MarketRateType.Borrow : 'disconnected'} />
            ),
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
    [events, hasPosition, tokens, chainId, marketId, userAddress],
  )

  const { tab = DEFAULT_TAB, onTabChange } = useTabs(tabOptions, DEFAULT_TAB)
  return { tab, onTabChange, tabOptions }
}
