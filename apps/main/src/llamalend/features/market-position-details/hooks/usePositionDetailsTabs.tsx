import { type ReactNode, useMemo } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { MarketTokens } from '@/llamalend/llama.utils'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { MarketRateType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { BorrowPositionDetails } from '../BorrowPositionDetails'
import { MarketEmptyPosition } from '../MarketEmptyPosition'

export type PositionDetailsTab = 'borrowDetails' | 'activity'
type PositionDetailsTabOption = TabOption<PositionDetailsTab> & { render: () => ReactNode }

const DEFAULT_TAB: PositionDetailsTab = 'borrowDetails'

export const usePositionDetailsTabs = ({
  events: { data: events, isLoading: activityIsLoading, error: activityError },
  hasPosition,
  params: { chainId, marketId, userAddress },
  tokens,
}: {
  events: QueryProp<ParsedUserCollateralEvent[]>
  hasPosition: boolean | undefined
  params: UserMarketParams
  tokens: Partial<MarketTokens>
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
            ) : userAddress ? (
              <MarketEmptyPosition rateType={MarketRateType.Borrow} />
            ) : (
              <EmptyStateCard
                title={t`Disconnected`}
                description={t`Please connect your wallet to view your positions.`}
                button={{ type: 'connect-wallet', label: t`Connect Wallet`, testId: 'market-disconnected' }}
              />
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
    [events, hasPosition, tokens, chainId, marketId, userAddress, activityIsLoading, activityError],
  )

  const { tab = DEFAULT_TAB, onTabChange } = useTabs(tabOptions, DEFAULT_TAB)
  return { tab, onTabChange, tabOptions }
}
