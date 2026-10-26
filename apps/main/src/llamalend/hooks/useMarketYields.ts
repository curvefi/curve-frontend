import type { MarketYields } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import { getMarketYields } from '@/llamalend/rates.utils'
import { useMarketCampaigns } from '@evm-ui/queries/campaigns/campaigns.query'
import { BlockchainIds } from '@evm-ui/utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'

/** Yields and borrow rewards of the current market */
export function useMarketYields(enabled: boolean): QueryProp<MarketYields> {
  const { marketType, controllerAddress, chainId, ammAddress, vaultToken } = useMarketContext()
  const blockchainId = BlockchainIds[chainId]
  const snapshots = useMarketSnapshots({ marketType, controllerAddress, blockchainId, enabled })
  const { data: campaigns, isLoading, error } = useMarketCampaigns({ blockchainId })
  return combineQueries(
    // useMarketCampaigns returns {} while loading; on an error the APR still shows, without the rewards
    [snapshots, { data: isLoading ? undefined : campaigns, isLoading, error }],
    (snapshots, campaigns) =>
      getMarketYields(snapshots, campaigns, {
        marketType,
        controllerAddress,
        vaultAddress: vaultToken?.address,
        ammAddress,
      }),
  )
}
