import {
  getAddCollateralPosition,
  getBorrowMorePosition,
  getCreateLoanPosition,
  getEquityLeverage,
  getRemoveCollateralPosition,
  getRepayPosition,
} from '@/llamalend/equity-leverage.utils'
import type { CreateLoanFormQueryParams } from '@/llamalend/features/borrow/types'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { hasZapV2 } from '@/llamalend/llama.utils'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { isLeverageBorrowMore } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { type UserState, useUserState } from '@/llamalend/queries/user/user-state.query'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, DISABLED_Q, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { ZERO } from '@ui/lib/decimal'

export type EquityLeverage = { current: QueryProp<Decimal | null>; future: QueryProp<Decimal | null> }

/**
 * Equity leverage of the open position (current) and of the position after the action (future).
 * Returns null when it is not shown: disabled, on the stable channel, or neither the open position nor the action
 * borrows through the zap.
 */
export function useEquityLeverage(
  {
    params,
    futurePosition,
    isZapBorrow = false,
  }: { params: UserMarketParams; futurePosition?: QueryProp<UserState | null>; isZapBorrow?: boolean },
  enabled = true,
): EquityLeverage | null {
  const isEnabled = useLlamalendEquityLeverage() && enabled
  const { marketType, controllerAddress, chainId, userAddress, tokens } = useMarketContext()
  const { data: collateralEvents } = useUserCollateralEvents({
    app: marketType,
    controllerAddress,
    chainId,
    userAddress,
    tokens,
  })
  const oraclePrice = q(useMarketOraclePrice(params, isEnabled))
  const current = combineQueries([q(useUserState(params, isEnabled)), oraclePrice], getEquityLeverage)
  const future = combineQueries(
    [futurePosition ?? DISABLED_Q, oraclePrice],
    (position, oraclePrice) => position && getEquityLeverage(position, oraclePrice),
  )
  return isEnabled && (isZapBorrow || collateralEvents?.isZapLeveraged) ? { current, future } : null
}

export const getFutureOrCurrentEquityLeverage = ({ current, future }: EquityLeverage) =>
  future.data === undefined ? current : future

export function useCreateLoanEquityLeverage(params: CreateLoanFormQueryParams) {
  const { market } = useMarketContext()
  return useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(
        useCreateLoanExpectedCollateral(params, !!params.leverageEnabled),
        ({ totalCollateral }) => getCreateLoanPosition({ collateral: totalCollateral, debt: params.debt ?? ZERO }),
      ),
      isZapBorrow: !!params.leverageEnabled && hasZapV2(market),
    },
    !!params.leverageEnabled,
  )
}

export function useBorrowMoreEquityLeverage(params: BorrowMoreParams) {
  const { market } = useMarketContext()
  const expectedCollateral = useBorrowMoreExpectedCollateral(params, !!params.leverageEnabled)
  const isZapBorrow = isLeverageBorrowMore(market, params.leverageEnabled)
  return useEquityLeverage({
    params,
    futurePosition: combineQueries(
      [q(useUserState(params)), isZapBorrow ? expectedCollateral : constQ(null)],
      (position, expected) =>
        getBorrowMorePosition(position, {
          collateral: (expected ? expected.totalCollateral : params.userCollateral) ?? ZERO,
          debt: params.debt ?? ZERO,
        }),
    ),
    isZapBorrow,
  })
}

export const useRepayEquityLeverage = (params: RepayParams, debt: QueryProp<Decimal | null>, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: combineQueries(
        [q(useUserState(params, enabled)), debt],
        (position, debt) =>
          debt &&
          getRepayPosition(position, {
            stateCollateral: params.stateCollateral ?? ZERO,
            debt,
            isFull: !!params.isFull,
          }),
      ),
    },
    enabled,
  )

export const useAddCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(q(useUserState(params, enabled)), position =>
        getAddCollateralPosition(position, params.userCollateral ?? ZERO),
      ),
    },
    enabled,
  )

export const useRemoveCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(q(useUserState(params, enabled)), position =>
        getRemoveCollateralPosition(position, params.userCollateral ?? ZERO),
      ),
    },
    enabled,
  )
