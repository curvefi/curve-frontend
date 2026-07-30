import { getMarket, hasZapV2 } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { parseMutationRoute } from '@ui-kit/entities/router-api'

/**
 * Determines the appropriate borrow more implementation based on market capabilities.
 */
export function getBorrowMoreImplementation(
  marketId: string | MarketTemplate,
  leverageEnabled: boolean | null | undefined,
) {
  const market = getMarket(marketId)
  /**
   * leverageEnabled reflects the position's history, so it can be true for soft-liquidated positions in legacy markets
   * without Zap v2. Keep direct borrow more available unless the market actually supports Zap v2.
   */
  const useZapV2 = !!leverageEnabled && hasZapV2(market)
  return market instanceof MintMarketTemplate
    ? useZapV2
      ? (['zapV2', market.leverageZapV2] as const)
      : (['unleveraged', market] as const)
    : useZapV2
      ? (['zapV2', market.leverageZapV2] as const)
      : (['unleveraged', market.loan] as const)
}

/**
 * Determines the borrow more implementation and constructs its argument tuple.
 * For unleveraged markets, returns `[type, impl, [userCollateral, debt]]`.
 * For leveraged markets, returns `[type, impl, [{ userCollateral, userBorrowed, debt, ...route }]]`.
 */
export function getBorrowMoreImplementationArgs(
  marketId: string | MarketTemplate,
  {
    userCollateral,
    userBorrowed,
    debt,
    leverageEnabled,
    routeId,
    slippage,
  }: Pick<BorrowMoreQuery, 'userCollateral' | 'userBorrowed' | 'debt' | 'routeId' | 'slippage'> & {
    leverageEnabled?: boolean | null
  },
) {
  const market = getMarket(marketId)
  const [type, impl] = getBorrowMoreImplementation(market, leverageEnabled)
  if (type === 'unleveraged') {
    return [type, impl, [userCollateral, debt]] as const
  }
  if (type === 'zapV2') {
    const routerArgs = {
      userCollateral,
      userBorrowed,
      dDebt: debt,
      debt,
      ...parseMutationRoute(market, { routeId, slippage, isRepay: false }),
    }
    return [type, impl, [routerArgs]] as const
  }
  throw new Error('Unknown borrow more implementation')
}

/**
 * Checks whether we should use the leverage methods to borrow more for a given market,
 * based on the implementation available and whether leverage is enabled.
 * This is used to determine if leverage queries should be enabled and whether to show that information in the UI.
 */
export const isLeverageBorrowMore = (
  marketId: string | MarketTemplate | null | undefined,
  leverageEnabled: boolean | null | undefined,
) => !!marketId && getBorrowMoreImplementation(marketId, leverageEnabled)[0] === 'zapV2'

/**
 * Checks whether leverage may be enabled for a given market.
 * This is used to determine whether to show the leverage toggle in the UI.
 */
export const isLeverageBorrowMoreSupported = (market?: MarketTemplate) => !!market && hasZapV2(market)
