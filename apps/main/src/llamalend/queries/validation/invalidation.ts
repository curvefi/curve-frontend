import type { UserMarketParams } from '@ui-kit/lib/model'
import { invalidateAllUserLendingSupplies, invalidateAllUserLendingVaults } from '../market-list/lending-vaults'
import { invalidateAllUserMintMarkets } from '../market-list/mint-markets'
import { invalidateMarketRates } from '../market-rates'
import { invalidateLoanExists } from '../loan-exists'
import { invalidateUserBalances } from '../user-balances.query'
import { invalidateUserHealth } from '../user-health.query'
import { invalidateUserPnlForMarket } from '../user-pnl.query'
import { invalidateUserState } from '../user-state.query'

/**
 * Helper function to easily invalidate the entire user state of a market.
 * Useful when their loan states has changed and the entire UI needs an update.
 */
export const invalidateAllUserMarketDetails = ({ marketId, userAddress, chainId }: UserMarketParams) =>
  Promise.all([
    invalidateLoanExists({ marketId, userAddress, chainId }),
    invalidateUserState({ marketId, userAddress, chainId }),
    invalidateUserHealth({ marketId, userAddress, chainId, isFull: true }),
    invalidateUserHealth({ marketId, userAddress, chainId, isFull: false }),
    invalidateUserBalances({ userAddress, chainId }),
    invalidateUserPnlForMarket({ marketId, userAddress, chainId }),
    invalidateMarketRates({ marketId, chainId }),
    invalidateAllUserMintMarkets(userAddress),
    invalidateAllUserLendingVaults(userAddress),
    invalidateAllUserLendingSupplies(userAddress),
  ])
