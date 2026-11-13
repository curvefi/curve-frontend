import { getCarryApr, getYieldMultiplier, type MarketYields } from '@/llamalend/equity-leverage.utils'
import type { CreateLoanFormQueryParams } from '@/llamalend/features/borrow/types'
import { useMarketContext } from '@/llamalend/features/market-context'
import {
  useAddCollateralFuturePosition,
  useBorrowMoreFuturePosition,
  useCreateLoanFuturePosition,
  useRemoveCollateralFuturePosition,
  useRepayFuturePosition,
} from '@/llamalend/hooks/useFuturePosition'
import { useMarketYields } from '@/llamalend/hooks/useMarketYields'
import { useMarketFutureRates } from '@/llamalend/queries/market/market-future-rates.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { type MarketRates, useMarketRates } from '@/llamalend/queries/market/market-rates.query'
import { type UserState, useUserState } from '@/llamalend/queries/user/user-state.query'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, futureOrCurrentQ, q, type QueryProp } from '@ui/features/queries/util'

/** Carry APR of the open position (current) and of the position after the action (future) */
export type CarryApr = {
  current: QueryProp<Decimal | null>
  future: QueryProp<Decimal | null>
  yieldMultiplier: QueryProp<Decimal | null>
}

const getPositionCarryApr = (
  position: UserState | null,
  oraclePrice: Decimal,
  { borrowApr }: MarketRates,
  yields: MarketYields,
) => position && getCarryApr(position, oraclePrice, borrowApr, yields)

/** Carry APR and yield multiplier of the open position and of the position after the action. Null when disabled. */
export function useCarryApr(
  {
    params,
    futurePosition = DISABLED_Q,
    debtDelta,
  }: {
    params: UserMarketParams
    futurePosition?: QueryProp<UserState | null>
    /** Debt change of the action, for the future borrow APR */
    debtDelta?: Decimal | null
  },
  enabled = true,
): CarryApr | null {
  const isEnabled = useLlamalendEquityLeverage() && enabled
  const { chainId } = useMarketContext()
  const oraclePrice = q(useMarketOraclePrice(params, isEnabled))
  const marketYields = useMarketYields(isEnabled)
  const currentRates = q(useMarketRates(params, isEnabled))
  const futureRates = futureOrCurrentQ(
    q(useMarketFutureRates({ ...params, chainId, debtDelta }, isEnabled)),
    currentRates,
  )
  const current = combineQueries(
    [q(useUserState(params, isEnabled)), oraclePrice, currentRates, marketYields],
    getPositionCarryApr,
  )
  const carryApr = {
    current,
    future: combineQueries([futurePosition, oraclePrice, futureRates, marketYields], getPositionCarryApr),
    yieldMultiplier: combineQueries([current, marketYields], (apr, { collateralYieldApr }) =>
      getYieldMultiplier(apr, collateralYieldApr),
    ),
  }
  return isEnabled ? carryApr : null
}

export const useCreateLoanCarryApr = (params: CreateLoanFormQueryParams, enabled = true) =>
  useCarryApr({ params, futurePosition: useCreateLoanFuturePosition(params), debtDelta: params.debt }, enabled)

export const useBorrowMoreCarryApr = (params: BorrowMoreParams, enabled = true) =>
  useCarryApr({ params, futurePosition: useBorrowMoreFuturePosition(params), debtDelta: params.debt }, enabled)

export const useRepayCarryApr = (
  params: RepayParams,
  { debt, debtDelta }: { debt: QueryProp<Decimal | null>; debtDelta: Decimal | undefined },
  enabled = true,
) => useCarryApr({ params, futurePosition: useRepayFuturePosition(params, debt, enabled), debtDelta }, enabled)

export const useAddCollateralCarryApr = (params: CollateralParams, enabled = true) =>
  useCarryApr({ params, futurePosition: useAddCollateralFuturePosition(params, enabled) }, enabled)

export const useRemoveCollateralCarryApr = (params: CollateralParams, enabled = true) =>
  useCarryApr({ params, futurePosition: useRemoveCollateralFuturePosition(params, enabled) }, enabled)
