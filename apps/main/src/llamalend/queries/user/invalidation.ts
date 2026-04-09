import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { rootKeys, type UserMarketQuery } from '@ui-kit/lib/model'
import { invalidateAllUserLendingSupplies, invalidateAllUserLendingVaults } from '../market-list/lending-vaults'
import { invalidateAllUserMintMarkets } from '../market-list/mint-markets'

/**
 * Invalidates all market and user-position queries after a mutation.
 * Use rootKeys to cover all queries for the market at once, since a user action can change the whole market.
 */
export const invalidateAllUserMarketDetails = ({ marketId, userAddress, chainId }: UserMarketQuery<IChainId>) => {
  ;(getLlamaMarket(marketId) as LendMarketTemplate)?.userPosition?.clearCache?.()
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: rootKeys.market({ chainId, marketId }) }),
    invalidateAllUserMintMarkets(userAddress),
    invalidateAllUserLendingVaults(userAddress),
    invalidateAllUserLendingSupplies(userAddress),
  ])
}
