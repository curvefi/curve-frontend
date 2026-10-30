import type { UserState } from '@/llamalend/queries/user/user-state.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import {
  decimalDiv,
  decimalEqual,
  decimalGreaterThan,
  decimalMinus,
  decimalMultiply,
  decimalSum,
  ZERO,
} from '@ui/lib/decimal'

/** What the position returns if closed now at the oracle price, in the borrowed token */
export const getEquity = ({ collateral, stablecoin, debt }: UserState, oraclePrice: Decimal) =>
  decimalMinus(decimalSum(decimalMultiply(collateral, oraclePrice), stablecoin), debt)

/** Collateral value divided by the equity, or null when the equity is zero. The borrowed tokens in the AMM only count in the equity. */
export const getEquityLeverage = (position: UserState, oraclePrice: Decimal) => {
  const equity = getEquity(position, oraclePrice)
  return decimalEqual(equity, ZERO) ? null : decimalDiv(decimalMultiply(position.collateral, oraclePrice), equity)
}

/** What the collateral and the borrowed tokens earn, and the borrow rewards, as APR in percent. Null when unknown. */
export type MarketYields = { collateralYieldApr: Decimal | null; borrowedYieldApr: Decimal; borrowRewardsApr: Decimal }

/** Looped APR: yearly yield on the equity after borrowing costs, in percent. Null when the equity is zero or a required rate is unknown. */
export const getLoopedApr = (
  position: UserState,
  oraclePrice: Decimal,
  borrowApr: Decimal | undefined,
  { collateralYieldApr, borrowedYieldApr, borrowRewardsApr }: MarketYields,
) => {
  const { collateral, stablecoin, debt } = position
  const equity = getEquity(position, oraclePrice)
  if (collateralYieldApr == null || borrowApr == null || decimalEqual(equity, ZERO)) return null
  const earned = decimalSum(
    decimalMultiply(collateral, oraclePrice, collateralYieldApr),
    decimalMultiply(stablecoin, borrowedYieldApr),
  )
  const borrowCost = decimalMultiply(debt, decimalMinus(borrowApr, borrowRewardsApr))
  return decimalDiv(decimalMinus(earned, borrowCost), equity)
}

/** How many times the collateral yield the equity earns. Null when the collateral has no positive yield. */
export const getYieldMultiplier = (loopedApr: Decimal | null, collateralYieldApr: Decimal | null) =>
  maybes([loopedApr, collateralYieldApr], (apr, yieldApr) =>
    decimalGreaterThan(yieldApr, ZERO) ? decimalDiv(apr, yieldApr) : null,
  ) ?? null
