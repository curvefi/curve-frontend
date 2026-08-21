import { getMarket, hasDeleverage, hasZapV2 } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import type { RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { parseMutationRoute, type RouteMutationMeta } from '@evm-ui/entities/router-api'
import type { FieldsOf } from '@evm-ui/lib'
import { type UserMarketQuery } from '@evm-ui/lib/model'
import { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { getUserState } from '../user/user-state.query'

type RepayFields = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed' | 'routeId' | 'slippage'>
export type RepayFormFields = Pick<RepayQuery, 'stateCollateral' | 'userCollateral' | 'userBorrowed'>

/** Returns true when repayment closes the loan using only debt tokens from the wallet. */
export const isFullRepayFromDebtToken = (
  isFull: boolean | undefined,
  stateCollateral: Decimal,
  userCollateral: Decimal,
) => !!isFull && !+stateCollateral && !+userCollateral

/**
 * Determines the appropriate repay implementation and its parameters based on the market type and leverage options.
 * We use ZapV2 for leveraged repayment. Otherwise:
 * - static legacy mint markets use deleverage when stateCollateral > 0 and deleverage is supported
 * - fallback to unleveraged repay from borrowed token
 */
export function getRepayImplementation(
  marketId: string | MarketTemplate,
  { stateCollateral, userCollateral, userBorrowed, routeId, slippage }: RepayFields,
  routeMeta?: Partial<RouteMutationMeta>,
) {
  const market = getMarket(marketId)
  const [hasUserBorrowed, hasUserCollateral, hasStateCollateral] = [userBorrowed, userCollateral, stateCollateral].map(
    v => !!+v,
  )
  if (market instanceof MintMarketTemplate) {
    if (!hasUserCollateral && !hasStateCollateral) return ['unleveragedMint', market, [userBorrowed]] as const
    if (hasZapV2(market) && !hasUserBorrowed) {
      const route = (routeMeta as RouteMutationMeta) ?? parseMutationRoute(market, { routeId, slippage, isRepay: true })
      return ['zapV2', market.leverageZapV2, [{ stateCollateral, userCollateral, ...route }]] as const
    }
    if (hasStateCollateral && !hasUserBorrowed && !hasUserCollateral && hasDeleverage(market))
      return ['deleverage', market.deleverage, [stateCollateral]] as const
  } else {
    if (!hasUserCollateral && !hasStateCollateral)
      return ['unleveragedLend', market.loan, [{ debt: userBorrowed }]] as const
    if (hasZapV2(market) && !hasUserBorrowed) {
      const route = (routeMeta as RouteMutationMeta) ?? parseMutationRoute(market, { routeId, slippage, isRepay: true })
      return ['zapV2', market.leverageZapV2, [{ stateCollateral, userCollateral, ...route }]] as const
    }
  }
  throw new Error(
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions -- Existing violation before enabling this rule.
    `Invalid repay implementation for ${market.constructor.name} market: ${marketId} with ${notFalsy(
      hasUserBorrowed && 'user borrowed',
      hasUserCollateral && 'user collateral',
      hasStateCollateral && 'state collateral',
    ).join(', ')}`,
  )
}

export function getRepayImplementationType(
  marketId: string | MarketTemplate,
  { userCollateral, stateCollateral, userBorrowed }: FieldsOf<RepayFormFields>,
) {
  const routeMeta = {} // we are ignoring the args in this helper anyway
  const [implementationType] = getRepayImplementation(
    marketId,
    {
      userCollateral: userCollateral ?? '0',
      stateCollateral: stateCollateral ?? '0',
      userBorrowed: userBorrowed ?? '0',
      slippage: '0', // irrelevant for this specific helper
      routeId: undefined,
    },
    routeMeta,
  )
  return implementationType
}

export const isRepayLeveraged = ({ marketId, ...fields }: FieldsOf<RepayFormFields & { marketId: string }>) =>
  !!marketId && getRepayImplementationType(marketId, fields) === 'zapV2'

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
