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

/** Collateral at the oracle price plus the borrowed tokens in the AMM, in the borrowed token */
const getPositionValue = ({ collateral, stablecoin }: UserState, oraclePrice: Decimal) =>
  decimalSum(decimalMultiply(collateral, oraclePrice), stablecoin)

/** How many times its equity the position is worth, or null when the equity is zero. */
export const getEquityLeverage = (position: UserState, oraclePrice: Decimal) => {
  const value = getPositionValue(position, oraclePrice)
  const equity = decimalMinus(value, position.debt)
  return decimalEqual(equity, ZERO) ? null : decimalDiv(value, equity)
}

/** What the collateral and the borrowed tokens earn, and the borrow rewards, as APR in percent. Null when unknown. */
export type MarketYields = { collateralYieldApr: Decimal | null; borrowedYieldApr: Decimal; borrowRewardsApr: Decimal }

/** Estimated APR on the equity, or null when the equity is zero or a required rate is unknown. */
export const getEquityLeverageApr = (
  position: UserState,
  oraclePrice: Decimal,
  borrowApr: Decimal | undefined,
  { collateralYieldApr, borrowedYieldApr, borrowRewardsApr }: MarketYields,
) => {
  const { collateral, stablecoin, debt } = position
  const equity = decimalMinus(getPositionValue(position, oraclePrice), debt)
  if (collateralYieldApr == null || borrowApr == null || decimalEqual(equity, ZERO)) return null
  const earned = decimalSum(
    decimalMultiply(collateral, oraclePrice, collateralYieldApr),
    decimalMultiply(stablecoin, borrowedYieldApr),
  )
  const borrowCost = decimalMultiply(debt, decimalMinus(borrowApr, borrowRewardsApr))
  return decimalDiv(decimalMinus(earned, borrowCost), equity)
}

/** How many times the collateral yield the equity earns. Null when the collateral has no positive yield. */
export const getYieldMultiplier = (equityLeverageApr: Decimal | null, collateralYieldApr: Decimal | null) =>
  maybes([equityLeverageApr, collateralYieldApr], (apr, yieldApr) =>
    decimalGreaterThan(yieldApr, ZERO) ? decimalDiv(apr, yieldApr) : null,
  ) ?? null
