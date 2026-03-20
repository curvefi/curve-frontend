import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { rootKeys, type UserMarketParams } from '@ui-kit/lib/model'
import { invalidateAllUserLendingSupplies, invalidateAllUserLendingVaults } from '../market-list/lending-vaults'
import { invalidateAllUserMintMarkets } from '../market-list/mint-markets'

/**
 * Invalidates all market and user-position queries after a mutation. Uses rootKeys.market as a prefix
 * to cover all queries for the market at once; cross-chain market-list queries have separate key roots.
 */
export const invalidateAllUserMarketDetails = ({ marketId, userAddress, chainId }: UserMarketParams<IChainId>) =>
  Promise.all([
    // we invalidate all market queries, not just for the user, as a user action changes the whole market
    queryClient.invalidateQueries({ queryKey: rootKeys.market({ chainId, marketId }) }),
    invalidateAllUserMintMarkets(userAddress),
    invalidateAllUserLendingVaults(userAddress),
    invalidateAllUserLendingSupplies(userAddress),
  ])
