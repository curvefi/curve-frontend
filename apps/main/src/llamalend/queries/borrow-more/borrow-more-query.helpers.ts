import { getLlamaMarket, hasLeverage, hasV2Leverage } from '@/llamalend/llama.utils'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'

/**
 * Determines the appropriate borrow more implementation based on market type.
 * We use V2 leverage if available, then leverage V1 (lend markets only).
 * Otherwise fallback to unleveraged borrow more.
 */
export function getBorrowMoreImplementation(marketId: string) {
  const market = getLlamaMarket(marketId)
  if (market instanceof MintMarketTemplate) {
    if (hasV2Leverage(market)) {
      return ['V2', market.leverageV2] as const
    }
  } else if (hasLeverage(market)) {
    return ['V1', market.leverage] as const
  }
  return ['unleveraged', market] as const
}

/**
 * Determines the appropriate borrow more implementation based on market type.
 * We use V2 leverage if available, then leverage V1 (lend markets only).
 * Otherwise fallback to unleveraged borrow more.
 */
export function getBorrowMoreImplementationArgs(
  marketId: string,
  { userCollateral, userBorrowed, debt }: Pick<BorrowMoreQuery, 'userCollateral' | 'userBorrowed' | 'debt'>,
) {
  const [type, impl] = getBorrowMoreImplementation(marketId)
  if (type === 'unleveraged') {
    if (+userBorrowed) throw new Error(`Invalid userBorrowed for unleveraged borrow more: ${userBorrowed}`)
    return [type, impl, [userCollateral, debt]] as const
  }
  return [type, impl, [userCollateral, userBorrowed, debt]] as const
}
