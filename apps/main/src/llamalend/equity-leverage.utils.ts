import type { UserState } from '@/llamalend/queries/user/user-state.query'
import type { Decimal } from '@primitives/decimal.utils'
import {
  decimalDiv,
  decimalEqual,
  decimalGreaterThan,
  decimalMinus,
  decimalMultiply,
  decimalSum,
  ZERO,
} from '@ui/lib/decimal'

type LoanAmounts = Pick<UserState, 'collateral' | 'debt'>

/** How many times its equity the position is worth, or null when the equity is zero. */
export const getEquityLeverage = ({ collateral, stablecoin, debt }: UserState, oraclePrice: Decimal) => {
  const value = decimalSum(decimalMultiply(collateral, oraclePrice), stablecoin)
  const equity = decimalMinus(value, debt)
  return decimalEqual(equity, ZERO) ? null : decimalDiv(value, equity)
}

/** APRs in percent. The collateral yield and borrow APR are null when unknown. */
export type LeverageRates = {
  collateralYieldApr: Decimal | null
  borrowedYieldApr: Decimal
  borrowApr: Decimal | null
  borrowRewardsApr: Decimal
}

/** Estimated APR on the equity, or null when the equity is zero or a required rate is unknown. */
export const getEquityLeverageApr = (
  { collateral, stablecoin, debt }: UserState,
  oraclePrice: Decimal,
  { collateralYieldApr, borrowedYieldApr, borrowApr, borrowRewardsApr }: LeverageRates,
) => {
  const collateralValue = decimalMultiply(collateral, oraclePrice)
  const equity = decimalMinus(decimalSum(collateralValue, stablecoin), debt)
  if (collateralYieldApr == null || borrowApr == null || decimalEqual(equity, ZERO)) return null
  const earned = decimalSum(
    decimalMultiply(collateralValue, collateralYieldApr),
    decimalMultiply(stablecoin, borrowedYieldApr),
  )
  const borrowCost = decimalMultiply(debt, decimalMinus(borrowApr, borrowRewardsApr))
  return decimalDiv(decimalMinus(earned, borrowCost), equity)
}

/** How many times the collateral yield the equity earns. Null when the collateral has no positive yield. */
export const getYieldMultiplier = (equityLeverageApr: Decimal | null, collateralYieldApr: Decimal | null) =>
  equityLeverageApr != null && collateralYieldApr != null && decimalGreaterThan(collateralYieldApr, ZERO)
    ? decimalDiv(equityLeverageApr, collateralYieldApr)
    : null

export const getCreateLoanPosition = ({ collateral, debt }: LoanAmounts): UserState => ({
  collateral,
  stablecoin: ZERO,
  debt,
})

/** Position after adding `collateral` and `debt`. */
export const getBorrowMorePosition = (position: UserState, { collateral, debt }: LoanAmounts): UserState => ({
  ...position,
  collateral: decimalSum(position.collateral, collateral),
  debt: decimalSum(position.debt, debt),
})

/**
 * Position after repaying with `stateCollateral` from the position, leaving `debt`.
 * A partial repay keeps the borrowed tokens in the AMM, because a partial repay from collateral reverts in soft
 * liquidation.
 */
export const getRepayPosition = (
  position: UserState,
  { stateCollateral, debt, isFull }: { stateCollateral: Decimal; debt: Decimal; isFull: boolean },
): UserState =>
  isFull
    ? { collateral: ZERO, stablecoin: ZERO, debt: ZERO }
    : { ...position, collateral: decimalMinus(position.collateral, stateCollateral), debt }

export const getAddCollateralPosition = (position: UserState, collateral: Decimal): UserState => ({
  ...position,
  collateral: decimalSum(position.collateral, collateral),
})

export const getRemoveCollateralPosition = (position: UserState, collateral: Decimal): UserState => ({
  ...position,
  collateral: decimalGreaterThan(collateral, position.collateral)
    ? ZERO
    : decimalMinus(position.collateral, collateral),
})
