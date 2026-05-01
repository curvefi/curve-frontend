import { getLlamaMarket, hasDeleverage, hasLeverage, hasV2Leverage, hasZapV2 } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { parseMutationRoute, type RouteMutationMeta } from '@ui-kit/entities/router-api'
import type { FieldsOf } from '@ui-kit/lib'
import { type UserMarketQuery } from '@ui-kit/lib/model'
import { getUserState } from '../user/user-state.query'

type RepayFields = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed' | 'routeId'> & {
  slippage?: RepayQuery['slippage']
}
export type RepayFormFields = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed'>

/** Returns true when repayment closes the loan using only debt tokens from the wallet. */
export const isFullRepayFromDebtToken = (
  isFull: boolean | undefined,
  stateCollateral: Decimal,
  userCollateral: Decimal,
) => isFull && !+stateCollateral && !+userCollateral

/**
 * Determines the appropriate repay implementation and its parameters based on the market type and leverage options.
 * We will use V2 leverage if available, then leverage V1 (lend markets only). Otherwise:
 * - mint markets: use deleverage when stateCollateral > 0 and deleverage is supported
 * - fallback to unleveraged repay from borrowed token
 */
export function getRepayImplementation(
  marketId: string | LlamaMarketTemplate,
  { stateCollateral, userCollateral, userBorrowed, routeId, slippage }: RepayFields,
  routeMeta?: Partial<RouteMutationMeta>,
) {
  const market = getLlamaMarket(marketId)
  const [hasUserBorrowed, hasUserCollateral, hasStateCollateral] = [userBorrowed, userCollateral, stateCollateral].map(
    v => !!+v,
  )
  if (market instanceof MintMarketTemplate) {
    if (!hasUserCollateral && !hasStateCollateral) return ['unleveragedMint', market, [userBorrowed]] as const
    if (hasV2Leverage(market))
      return ['V2', market.leverageV2, [stateCollateral, userCollateral, userBorrowed]] as const
    if (hasStateCollateral && !hasUserBorrowed && !hasUserCollateral && hasDeleverage(market))
      return ['deleverage', market.deleverage, [stateCollateral]] as const
  } else {
    if (!hasUserCollateral && !hasStateCollateral)
      return ['unleveragedLend', market.loan, [{ debt: userBorrowed }]] as const
    if (hasZapV2(market)) {
      const route =
        (routeMeta as RouteMutationMeta) ?? parseMutationRoute(routeId, slippage ?? '0', market.leverageZapV2)
      return ['zapV2', market.leverageZapV2, [{ stateCollateral, userCollateral, userBorrowed, ...route }]] as const
    }
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

export function getRepayImplementationType(
  marketId: string | LlamaMarketTemplate,
  { userCollateral, stateCollateral, userBorrowed }: FieldsOf<RepayFormFields>,
) {
  const routeMeta = {} // we are ignoring the args in this helper anyway
  const [implementationType] = getRepayImplementation(
    marketId,
    {
      userCollateral: userCollateral ?? '0',
      stateCollateral: stateCollateral ?? '0',
      userBorrowed: userBorrowed ?? '0',
      routeId: undefined,
    },
    routeMeta,
  )
  return implementationType
}

export const isRepayLeveraged = ({ marketId, ...fields }: FieldsOf<RepayFormFields & { marketId: string }>) =>
  !!marketId && ['V1', 'V2', 'zapV2'].includes(getRepayImplementationType(marketId, fields))

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
