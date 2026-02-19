import { getLlamaMarket, hasDeleverage, hasV2Leverage } from '@/llamalend/llama.utils'
import { getUserState } from '@/llamalend/queries/user'
import type { RepayQuery } from '@/llamalend/queries/validation/manage-loan.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type UserMarketQuery } from '@ui-kit/lib/model'
import { parseRoute } from '@ui-kit/widgets/RouteProvider'

type RepayFields = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed' | 'route'>
type RepayFieldsWithoutRoute = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed'>

export function getRepayImplementationType(
  marketId: string,
  { stateCollateral, userCollateral, userBorrowed }: RepayFieldsWithoutRoute,
) {
  const market = getLlamaMarket(marketId)

  if (market instanceof MintMarketTemplate) {
    if (hasV2Leverage(market)) return 'V2' as const
    if (+stateCollateral && hasDeleverage(market)) {
      if (+userBorrowed) throw new Error(`Invalid userBorrowed for deleverage: ${userBorrowed}`)
      if (+userCollateral) throw new Error(`Invalid userCollateral for deleverage: ${userCollateral}`)
      return 'deleverage' as const
    }
  } else if (market.leverageZapV2.hasLeverage()) {
    return 'zapV2' as const
  } else {
    return 'V1' as const
  }

  if (+userCollateral) throw new Error(`Invalid userCollateral for repay: ${userCollateral}`)
  if (+stateCollateral) throw new Error(`Invalid stateCollateral for repay: ${stateCollateral}`)
  return 'unleveraged' as const
}

/**
 * Determines the appropriate repay implementation and its parameters based on the market type and leverage options.
 * We will use V2 leverage if available, then leverage V1 (lend markets only). Otherwise:
 * - mint markets: use deleverage when stateCollateral > 0 and deleverage is supported
 * - fallback to unleveraged repay from borrowed token
 */
export function getRepayImplementation(
  marketId: string,
  { stateCollateral, userCollateral, userBorrowed, route }: RepayFields,
) {
  const market = getLlamaMarket(marketId)
  const type = getRepayImplementationType(marketId, { stateCollateral, userCollateral, userBorrowed })
  if (market instanceof MintMarketTemplate) {
    switch (type) {
      case 'V2':
        return ['V2', market.leverageV2, [stateCollateral, userCollateral, userBorrowed]] as const
      case 'deleverage':
        return ['deleverage', market.deleverage, [stateCollateral]] as const
      case 'unleveraged':
        return ['unleveraged', market, [userBorrowed]] as const
    }
  } else
    switch (type) {
      case 'zapV2':
        return [
          'zapV2',
          market.leverageZapV2,
          [{ stateCollateral, userCollateral, userBorrowed, ...parseRoute(route) }],
        ] as const
      case 'V1':
        return ['V1', market.leverage, [stateCollateral, userCollateral, userBorrowed]] as const
      case 'unleveraged':
        return ['unleveraged', market, [userBorrowed]] as const
    }
  throw new Error(`Invalid repay implementation type: ${type}`)
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
