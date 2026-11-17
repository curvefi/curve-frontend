import type { MarketYields } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketCampaigns } from '@/llamalend/features/market-list/hooks/useMarketCampaigns'
import { useCollateralYields } from '@/llamalend/hooks/useCollateralYields'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import { getMarketYields } from '@/llamalend/rates.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'

/** Yields and borrow rewards of the current market */
export function useMarketYields(enabled: boolean): QueryProp<MarketYields> {
  const { chainId, market, marketType, controllerAddress, blockchainId, ammAddress, vaultToken } = useMarketContext()
  const snapshots = useMarketSnapshots({ marketType, controllerAddress, blockchainId, enabled })
  const { data: campaigns, isLoading, error } = useMarketCampaigns({ blockchainId })
  return combineQueries(
    [
      useCollateralYields({ chainId, marketId: market?.id, marketType, controllerAddress }, enabled),
      snapshots,
      // useMarketCampaigns returns {} while loading; on an error the APR still shows, without the rewards
      { data: isLoading ? undefined : campaigns, isLoading, error },
    ],
    (collateralYields, snapshots, campaigns) =>
      getMarketYields(collateralYields, snapshots, campaigns, {
        marketType,
        controllerAddress,
        vaultAddress: vaultToken?.address,
        ammAddress,
      }),
  )
}
