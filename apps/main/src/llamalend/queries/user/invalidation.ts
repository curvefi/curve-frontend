import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { invalidateAllUserLendingSupplies, invalidateAllUserLendingVaults } from '../market-list/lending-vaults'
import { invalidateAllUserMintMarkets } from '../market-list/mint-markets'
import { invalidateMarketRates } from '../market-rates'
import { invalidateUserBalances } from './user-balances.query'
import { invalidateUserBands } from './user-bands.query'
import { invalidateUserCurrentLeverage } from './user-current-leverage.query'
import { invalidateUserHealth } from './user-health.query'
import { invalidateLoanExists } from './user-loan-exists.query'
import { invalidateUserMarketBalances } from './user-market-balances.query'
import { invalidateUserPrices } from './user-prices.query'
import { invalidateUserState } from './user-state.query'

/**
 * Helper function to invalidate all user-position queries for a market.
 * Keeps user-position data in sync after transactions.
 */
export const invalidateAllUserPositionQueries = ({ marketId, userAddress, chainId }: UserMarketParams<IChainId>) =>
  Promise.all([
    invalidateLoanExists({ marketId, userAddress, chainId }),
    invalidateUserState({ marketId, userAddress, chainId }),
    invalidateUserHealth({ marketId, userAddress, chainId, isFull: true }),
    invalidateUserHealth({ marketId, userAddress, chainId, isFull: false }),
    invalidateUserBalances({ marketId, userAddress, chainId }),
    invalidateUserBands({ marketId, userAddress, chainId }),
    invalidateUserCurrentLeverage({ marketId, userAddress, chainId }),
    invalidateUserMarketBalances({ marketId, chainId }),
    invalidateUserPrices({ marketId, userAddress, chainId, loanExists: true }),
  ])

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
