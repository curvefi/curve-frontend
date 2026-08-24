import { useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { LiquidityDetails } from '../liquidity-details'
import { useLiquidityDetails, type UseLiquidityDetailsParams } from '../liquidity-details/hooks/useLiquidityDetails'

type UserPositionTabsParams = { blockchainId: string } & UseLiquidityDetailsParams

const menu = [
  { value: 'liquidityDetails', label: t`Liquidity Details`, component: LiquidityDetails },
  // There'll be a (user) activity tab here in the future (as per Figma)
]

export const usePositionDetailsTabs = ({
  blockchainId,
  chainId,
  poolDataCacheOrApi,
  poolId,
}: UserPositionTabsParams) => {
  const { hasPosition } = useLiquidityDetails({ chainId, poolDataCacheOrApi, poolId })
  const tabs = useTabs({ menu, params: { blockchainId, chainId, poolDataCacheOrApi, poolId } })
  return { hasPosition, ...tabs }
}
