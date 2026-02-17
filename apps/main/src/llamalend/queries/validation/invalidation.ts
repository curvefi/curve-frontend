import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { invalidateLoanExists } from '../loan-exists'
import { invalidateAllUserLendingSupplies, invalidateAllUserLendingVaults } from '../market-list/lending-vaults'
import { invalidateAllUserMintMarkets } from '../market-list/mint-markets'
import { invalidateMarketRates } from '../market-rates'
import { invalidateAllUserPositionQueries } from '../user/invalidation'

/**
 * Helper function to easily invalidate the entire user state of a market.
 * Useful when their loan states has changed and the entire UI needs an update.
 */
export const invalidateBorrowPositionQueries = ({ marketId, userAddress, chainId }: UserMarketParams<IChainId>) =>
  Promise.all([
    invalidateLoanExists({ marketId, userAddress, chainId }),
    invalidateAllUserPositionQueries({ marketId, userAddress, chainId }),
    invalidateMarketRates({ marketId, chainId }),
    invalidateAllUserMintMarkets(userAddress),
    invalidateAllUserLendingVaults(userAddress),
    invalidateAllUserLendingSupplies(userAddress),
  ])

export const invalidateAllUserMarketDetails = invalidateBorrowPositionQueries
