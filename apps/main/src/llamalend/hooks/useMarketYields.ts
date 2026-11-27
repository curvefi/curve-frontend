import type { MarketYields } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketCampaigns } from '@/llamalend/features/market-list/hooks/useMarketCampaigns'
import { useCollateralYields } from '@/llamalend/hooks/useCollateralYields'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import { getMarketYields } from '@/llamalend/rates.utils'
import { q, type QueryProp } from '@ui/features/queries/util'

/** Yields and borrow rewards of the current market */
export function useMarketYields(enabled: boolean): QueryProp<MarketYields> {
  const { chainId, market, marketType, controllerAddress, blockchainId, ammAddress, vaultToken } = useMarketContext()
  const snapshots = useMarketSnapshots({ marketType, controllerAddress, blockchainId, enabled })
  const { data: campaigns, isLoading, error } = useMarketCampaigns({ blockchainId })
  return getMarketYields(
    useCollateralYields({ chainId, marketId: market?.id, marketType, controllerAddress }, enabled),
    snapshots,
    // useMarketCampaigns returns {} while loading; on an error the APR still shows, without the rewards
    q({ data: isLoading ? undefined : campaigns, isLoading, error }),
    { marketType, controllerAddress, vaultAddress: vaultToken?.address, ammAddress },
  )
}
