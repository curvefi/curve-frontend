import type { CreateLoanFormQueryParams } from '@/llamalend/features/borrow/types'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { isLeverageBorrowMore } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimalGreaterThan, decimalMinus, decimalSum, ZERO } from '@ui/lib/decimal'

/** The new position: the leverage quote's total collateral, or the deposited collateral without leverage */
export function useCreateLoanFuturePosition(params: CreateLoanFormQueryParams) {
  const expectedCollateral = useCreateLoanExpectedCollateral(params, !!params.leverageEnabled)
  return mapQuery(
    params.leverageEnabled
      ? mapQuery(expectedCollateral, ({ totalCollateral }) => totalCollateral)
      : constQ(params.userCollateral ?? ZERO),
    collateral => ({ collateral, convertedBorrowed: ZERO, debt: params.debt ?? ZERO }),
  )
}

export function useBorrowMoreFuturePosition(params: BorrowMoreParams) {
  const { market } = useMarketContext()
  const expectedCollateral = useBorrowMoreExpectedCollateral(params, !!params.leverageEnabled)
  return combineQueries(
    [q(useUserState(params)), isLeverageBorrowMore(market, params.leverageEnabled) ? expectedCollateral : constQ(null)],
    (position, expected) => ({
      ...position,
      collateral: decimalSum(
        position.collateral,
        (expected ? expected.totalCollateral : params.userCollateral) ?? ZERO,
      ),
      debt: decimalSum(position.debt, params.debt ?? ZERO),
    }),
  )
}

export const useRepayFuturePosition = (params: RepayParams, debt: QueryProp<Decimal | null>, enabled = true) =>
  combineQueries(
    [q(useUserState(params, enabled)), debt],
    // a partial repay keeps the borrowed tokens in the AMM: a partial repay from collateral reverts in soft liquidation
    (position, debt) =>
      debt &&
      (params.isFull
        ? { collateral: ZERO, convertedBorrowed: ZERO, debt: ZERO }
        : { ...position, collateral: decimalMinus(position.collateral, params.stateCollateral ?? ZERO), debt }),
  )

export const useAddCollateralFuturePosition = (params: CollateralParams, enabled = true) =>
  mapQuery(q(useUserState(params, enabled)), position => ({
    ...position,
    collateral: decimalSum(position.collateral, params.userCollateral ?? ZERO),
  }))

export const useRemoveCollateralFuturePosition = (params: CollateralParams, enabled = true) =>
  mapQuery(q(useUserState(params, enabled)), position => ({
    ...position,
    collateral: decimalGreaterThan(params.userCollateral ?? ZERO, position.collateral)
      ? ZERO
      : decimalMinus(position.collateral, params.userCollateral ?? ZERO),
  }))
