import { getLlamaMarket, hasLeverage, hasV2Leverage } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'

/**
 * Determines the appropriate borrow more implementation based on market type.
 * We use V2 leverage if available, then leverage V1 (lend markets only).
 * Otherwise fallback to unleveraged borrow more.
 */
export function getBorrowMoreImplementation(
  marketId: string | LlamaMarketTemplate,
  leverageEnabled: boolean | null | undefined,
) {
  const market = typeof marketId === 'string' ? getLlamaMarket(marketId) : marketId
  leverageEnabled ??= true // until we know if leverage is supported, use the latest implementation available
  return market instanceof MintMarketTemplate
    ? leverageEnabled && hasV2Leverage(market)
      ? (['V2', market.leverageV2] as const)
      : (['unleveraged', market] as const)
    : leverageEnabled && hasLeverage(market)
      ? (['V1', market.leverage] as const)
      : (['unleveraged', market] as const)
}

/**
 * Determines the borrow more implementation and constructs its argument tuple.
 * For unleveraged markets, returns `[type, impl, [userCollateral, debt]]`.
 * For leveraged (V1/V2) markets, returns `[type, impl, [userCollateral, userBorrowed, debt]]`.
 */
export function getBorrowMoreImplementationArgs(
  marketId: string | LlamaMarketTemplate,
  {
    userCollateral,
    userBorrowed,
    debt,
    leverageEnabled,
  }: Pick<BorrowMoreQuery, 'userCollateral' | 'userBorrowed' | 'debt'> & {
    leverageEnabled?: boolean | null
  },
) {
  const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
  if (type === 'unleveraged') {
    if (+userBorrowed) throw new Error(`Invalid userBorrowed for unleveraged borrow more: ${userBorrowed}`)
    return [type, impl, [userCollateral, debt]] as const
  }
  return [type, impl, [userCollateral, userBorrowed, debt]] as const
}

/**
 * Checks whether we should use the leverage methods to borrow more for a given market,
 * based on the implementation available and whether leverage is enabled.
 * This is used to determine if leverage queries should be enabled and whether to show that information in the UI.
 */
export const isLeverageBorrowMore = (
  marketId: string | LlamaMarketTemplate | null | undefined,
  leverageEnabled: boolean | null | undefined,
) => !!marketId && ['V1', 'V2'].includes(getBorrowMoreImplementation(marketId, leverageEnabled)[0])

/**
 * Checks whether leverage may be enabled for a given market.
 * This is used to determine whether to show the leverage toggle in the UI.
 */
export const isLeverageBorrowMoreSupported = (market?: LlamaMarketTemplate) =>
  !!market && isLeverageBorrowMore(market, true)
