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

/**
 * Equity leverage = position value ÷ equity.
 * Position value = C·p + X: collateral C at oracle price p, plus borrowed tokens X held in the AMM after soft liquidation.
 * Equity = position value − debt. The leverage is negative when the equity is negative, and null when it is zero.
 */
export const getEquityLeverage = ({ collateral, stablecoin, debt }: UserState, oraclePrice: Decimal) => {
  const value = decimalSum(decimalMultiply(collateral, oraclePrice), stablecoin)
  const equity = decimalMinus(value, debt)
  return decimalEqual(equity, ZERO) ? null : decimalDiv(value, equity)
}

/** Position opened by a new loan. */
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
 * A full repay closes the position. A partial repay keeps the borrowed tokens in the AMM, because a partial repay from
 * collateral reverts in soft liquidation.
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
