import { getEquityLeverage } from '@/llamalend/equity-leverage.utils'
import type { CreateLoanFormQueryParams } from '@/llamalend/features/borrow/types'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import {
  useAddCollateralFuturePosition,
  useBorrowMoreFuturePosition,
  useCreateLoanFuturePosition,
  useRemoveCollateralFuturePosition,
  useRepayFuturePosition,
} from '@/llamalend/hooks/useFuturePosition'
import { hasZapV2 } from '@/llamalend/llama.utils'
import { isLeverageBorrowMore } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { type UserState, useUserState } from '@/llamalend/queries/user/user-state.query'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, DISABLED_Q, mapQuery, q, type QueryProp } from '@ui/features/queries/util'

/** Leverage of the open position (current) and of the position after the action (future) */
export type EquityLeverage = {
  /** Whether the open position or the action borrows through the zap, null when the history can't tell */
  isZapLeveraged: QueryProp<boolean | null>
  /** Null when neither the open position nor the action borrows through the zap */
  current: QueryProp<Decimal | null>
  /** Null when neither the open position nor the action borrows through the zap */
  future: QueryProp<Decimal | null>
  /** The leverage the open position opened at */
  opening: QueryProp<Decimal | null>
}

/** Equity leverage of the open position and of the position after the action */
export function useEquityLeverage(
  {
    params,
    futurePosition = DISABLED_Q,
    isZapBorrow = false,
  }: { params: UserMarketParams; futurePosition?: QueryProp<UserState | null>; isZapBorrow?: boolean },
  enabled = true,
): EquityLeverage {
  const { marketType, controllerAddress, chainId, userAddress, tokens } = useMarketContext()
  const collateralEvents = useUserCollateralEvents({ app: marketType, controllerAddress, chainId, userAddress, tokens })
  const oraclePrice = q(useMarketOraclePrice(params, enabled))
  const isZapLeveraged = isZapBorrow ? constQ(true) : mapQuery(collateralEvents, events => events.isZapLeveraged)
  return {
    isZapLeveraged,
    current: combineQueries(
      [isZapLeveraged, q(useUserState(params, enabled)), oraclePrice],
      (isZapLeveraged, position, oraclePrice) => (isZapLeveraged ? getEquityLeverage(position, oraclePrice) : null),
    ),
    future: combineQueries([isZapLeveraged, futurePosition, oraclePrice], (isZapLeveraged, position, oraclePrice) =>
      isZapLeveraged && position ? getEquityLeverage(position, oraclePrice) : null,
    ),
    opening: mapQuery(collateralEvents, ({ openingLeverage }) => openingLeverage),
  }
}

export function useCreateLoanEquityLeverage(params: CreateLoanFormQueryParams) {
  const { market } = useMarketContext()
  return useEquityLeverage(
    {
      params,
      futurePosition: useCreateLoanFuturePosition(params),
      isZapBorrow: !!params.leverageEnabled && hasZapV2(market),
    },
    !!params.leverageEnabled,
  )
}

export function useBorrowMoreEquityLeverage(params: BorrowMoreParams) {
  const { market } = useMarketContext()
  return useEquityLeverage({
    params,
    futurePosition: useBorrowMoreFuturePosition(params),
    isZapBorrow: isLeverageBorrowMore(market, params.leverageEnabled),
  })
}

export const useRepayEquityLeverage = (params: RepayParams, debt: QueryProp<Decimal | null>, enabled = true) =>
  useEquityLeverage({ params, futurePosition: useRepayFuturePosition(params, debt, enabled) }, enabled)

export const useAddCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage({ params, futurePosition: useAddCollateralFuturePosition(params, enabled) }, enabled)

export const useRemoveCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage({ params, futurePosition: useRemoveCollateralFuturePosition(params, enabled) }, enabled)
