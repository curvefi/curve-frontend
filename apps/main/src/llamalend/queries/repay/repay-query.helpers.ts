import { getLlamaMarket, hasDeleverage, hasLeverage, hasV2Leverage } from '@/llamalend/llama.utils'
import { getUserState } from '@/llamalend/queries/user-state.query'
import type { RepayQuery } from '@/llamalend/queries/validation/manage-loan.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type UserMarketQuery } from '@ui-kit/lib/model'

/**
 * Determines the appropriate repay implementation and its parameters based on the market type and leverage options.
 * We will use V2 leverage if available, then leverage V1. Otherwise:
 * - if deleverage is supported and userCollateral > 0, we use deleverage
 * - otherwise, we use the unleveraged implementation.
 */
export function getRepayImplementation(
  marketId: string,
  {
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed'>,
) {
  const market = getLlamaMarket(marketId)

  if (market instanceof MintMarketTemplate) {
    if (hasV2Leverage(market)) {
      return ['V2', market.leverageV2, [stateCollateral, userCollateral, userBorrowed]] as const
    }
    if (+userCollateral && hasDeleverage(market)) {
      // use deleverage only if userCollateral > 0 & supported, otherwise fall back to unleveraged
      if (+userBorrowed) throw new Error(`Invalid userBorrowed for deleverage: ${userBorrowed}`)
      if (+stateCollateral) throw new Error(`Invalid stateCollateral for deleverage: ${stateCollateral}`)
      return ['deleverage', market.deleverage, [userCollateral]] as const
    }
  } else if (hasLeverage(market)) {
    // v1 leverage for mint markets is ignored, it doesn't support repay. Supported via deleverage above
    return ['V1', market.leverage, [stateCollateral, userCollateral, userBorrowed]] as const
  }

  if (+userCollateral) throw new Error(`Invalid userCollateral for deleverage: ${userCollateral}`)
  if (+stateCollateral) throw new Error(`Invalid stateCollateral for deleverage: ${stateCollateral}`)
  return ['unleveraged', market, [userBorrowed]] as const
}

/**
 * This helper gets the user's debt from the user state query cache and converts it to a number. It is only safe to use
 * in when the user state query was called before (usually checked in the validation).
 */
export const getUserDebtFromQueryCache = ({ chainId, userAddress, marketId }: UserMarketQuery) =>
  +(
    getUserState({
      chainId,
      marketId,
      userAddress,
    })?.debt ?? 0
  )
