import type { UserMarketParams } from '@ui-kit/lib/model'
import { invalidateUserBalances } from '../user-balances.query'
import { invalidateUserHealth } from '../user-health.query'
import { invalidateUserState } from '../user-state.query'

/**
 * Helper function to easily invalidate the entire user state of a market.
 * Useful when their loan states has changed and the entire UI needs an update.
 */
export const invalidateAllUserMarketDetails = ({ marketId, userAddress, chainId }: UserMarketParams) =>
  Promise.all([
    invalidateUserState({ marketId, userAddress, chainId }),
    invalidateUserHealth({ marketId, userAddress, chainId }),
    invalidateUserBalances({ userAddress, chainId }),
  ])
