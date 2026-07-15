import { getMarket, hasLeverage, hasV2Leverage, hasZapV2 } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { parseMutationRoute } from '@ui-kit/entities/router-api'

/**
 * Determines the appropriate borrow more implementation based on market type.
 * We use V2 leverage if available, then leverage V1 (lend markets only).
 * Otherwise fallback to unleveraged borrow more.
 */
export function getBorrowMoreImplementation(
  marketId: string | MarketTemplate,
  leverageEnabled: boolean | null | undefined,
) {
  const market = getMarket(marketId)
  leverageEnabled ??= false // we don't know if leverage is supported when the API is offline
  return market instanceof MintMarketTemplate
    ? leverageEnabled && hasV2Leverage(market)
      ? (['V2', market.leverageV2] as const)
      : (['unleveraged', market] as const)
    : leverageEnabled && hasLeverage(market)
      ? hasZapV2(market)
        ? (['zapV2', market.leverageZapV2] as const)
        : (['V1', market.leverage] as const)
      : (['unleveraged', market.loan] as const)
}

/**
 * Determines the borrow more implementation and constructs its argument tuple.
 * For unleveraged markets, returns `[type, impl, [userCollateral, debt]]`.
 * For leveraged (V1/V2) markets, returns `[type, impl, [userCollateral, userBorrowed, debt]]`.
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
  const args = [userCollateral, userBorrowed, debt] as const
  if (type == 'V1') return [type, impl, args] as const
  return [type, impl, args] as const
}

/**
 * Checks whether we should use the leverage methods to borrow more for a given market,
 * based on the implementation available and whether leverage is enabled.
 * This is used to determine if leverage queries should be enabled and whether to show that information in the UI.
 */
export const isLeverageBorrowMore = (
  marketId: string | MarketTemplate | null | undefined,
  leverageEnabled: boolean | null | undefined,
) => !!marketId && ['V1', 'V2', 'zapV2'].includes(getBorrowMoreImplementation(marketId, leverageEnabled)[0])

/**
 * Checks whether leverage may be enabled for a given market.
 * This is used to determine whether to show the leverage toggle in the UI.
 */
export const isLeverageBorrowMoreSupported = (market?: MarketTemplate) => !!market && isLeverageBorrowMore(market, true)
