import { getLlamaMarket, hasDeleverage, hasLeverage, hasV2Leverage, hasZapV2 } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { getUserState } from '@/llamalend/queries/user'
import type { RepayQuery } from '@/llamalend/queries/validation/manage-loan.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { notFalsy } from '@primitives/objects.utils'
import { type UserMarketQuery } from '@ui-kit/lib/model'
import { parseRoute, type RouteMeta } from '@ui-kit/widgets/RouteProvider'

type RepayFields = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed' | 'routeId'>
type RepayFieldsWithoutRoute = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed'>

/**
 * Determines the appropriate repay implementation and its parameters based on the market type and leverage options.
 * We will use V2 leverage if available, then leverage V1 (lend markets only). Otherwise:
 * - mint markets: use deleverage when stateCollateral > 0 and deleverage is supported
 * - fallback to unleveraged repay from borrowed token
 */
export function getRepayImplementation(
  marketId: string | LlamaMarketTemplate,
  { stateCollateral, userCollateral, userBorrowed, routeId }: RepayFields,
  routeMeta?: Partial<RouteMeta>,
) {
  const market = typeof marketId === 'string' ? getLlamaMarket(marketId) : marketId
  const [hasUserBorrowed, hasUserCollateral, hasStateCollateral] = [userBorrowed, userCollateral, stateCollateral].map(
    (v) => !!+v,
  )
  if (!hasUserCollateral && !hasStateCollateral) return ['unleveraged', market, [userBorrowed]] as const
  if (market instanceof MintMarketTemplate) {
    if (hasV2Leverage(market))
      return ['V2', market.leverageV2, [stateCollateral, userCollateral, userBorrowed]] as const
    if (hasStateCollateral && !hasUserBorrowed && !hasUserCollateral && hasDeleverage(market))
      return ['deleverage', market.deleverage, [stateCollateral]] as const
  } else {
    if (hasZapV2(market))
      return [
        'zapV2',
        market.leverageZapV2,
        [{ stateCollateral, userCollateral, userBorrowed, ...((routeMeta as RouteMeta) ?? parseRoute(routeId)) }],
      ] as const
    if (hasLeverage(market)) return ['V1', market.leverage, [stateCollateral, userCollateral, userBorrowed]] as const
  }
  throw new Error(
    `Invalid repay implementation for ${market.constructor.name} market: ${marketId} with ${notFalsy(
      hasUserBorrowed && 'user borrowed',
      hasUserCollateral && 'user collateral',
      hasStateCollateral && 'state collateral',
    ).join(', ')}`,
  )
}

export function getRepayImplementationType(marketId: string | LlamaMarketTemplate, fields: RepayFieldsWithoutRoute) {
  const params = { ...fields, routeId: undefined }
  const routeMeta = {} // we are ignoring the args in this helper anyway
  const [impl] = getRepayImplementation(marketId, params, routeMeta)
  return impl
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
