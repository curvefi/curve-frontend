import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { invalidateAllUserLendingSupplies, invalidateAllUserLendingVaults } from '../market-list/lending-vaults'
import { invalidateAllUserMintMarkets } from '../market-list/mint-markets'
import { invalidateMarketRates } from '../market-rates'
import { invalidateAllUserPositionQueries } from '../user'

/**
 * Helper function to easily invalidate the entire user state of a market.
 * Useful when their loan states has changed and the entire UI needs an update.
 */
export const invalidateAllUserMarketDetails = ({ marketId, userAddress, chainId }: UserMarketParams<IChainId>) =>
  Promise.all([
    invalidateAllUserPositionQueries({ marketId, userAddress, chainId }),
    invalidateMarketRates({ marketId, chainId }),
    invalidateAllUserMintMarkets(userAddress),
    invalidateAllUserLendingVaults(userAddress),
    invalidateAllUserLendingSupplies(userAddress),
  ])
