import { type ReactNode, useMemo } from 'react'
import { useTabs } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { LiquidityDetails } from '../liquidity-details'
import { useLiquidityDetails, type UseLiquidityDetailsParams } from '../liquidity-details/hooks/useLiquidityDetails'

type UserPositionTab = 'liquidityDetails'
type UserPositionTabOption = TabOption<UserPositionTab> & { render: () => ReactNode }

const DEFAULT_TAB: UserPositionTab = 'liquidityDetails'

export const usePositionDetailsTabs = ({
  blockchainId,
  chainId,
  poolDataCacheOrApi,
  poolId,
}: { blockchainId: string } & UseLiquidityDetailsParams) => {
  const { hasPosition } = useLiquidityDetails({ chainId, poolDataCacheOrApi, poolId })

  const tabOptions = useMemo<UserPositionTabOption[]>(
    () => [
      {
        value: DEFAULT_TAB,
        label: t`Liquidity Details`,
        render: () => (
          <LiquidityDetails
            blockchainId={blockchainId}
            chainId={chainId}
            poolDataCacheOrApi={poolDataCacheOrApi}
            poolId={poolId}
          />
        ),
      },
      // There'll be a (user) activity tab here in the future (as per Figma)
    ],
    [blockchainId, chainId, poolDataCacheOrApi, poolId],
  )

  const { tab = DEFAULT_TAB, onTabChange } = useTabs(tabOptions, DEFAULT_TAB)
  return { hasPosition, tab, onTabChange, tabOptions }
}
