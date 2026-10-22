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
