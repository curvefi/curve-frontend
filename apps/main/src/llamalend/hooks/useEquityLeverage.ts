import {
  getEquityLeverage,
  getEquityLeverageApr,
  getYieldMultiplier,
  type MarketYields,
} from '@/llamalend/equity-leverage.utils'
import type { CreateLoanFormQueryParams } from '@/llamalend/features/borrow/types'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useMarketYields } from '@/llamalend/hooks/useMarketYields'
import { hasZapV2 } from '@/llamalend/llama.utils'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { isLeverageBorrowMore } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
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
import { constQ, DISABLED_Q, futureOrCurrentQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimalGreaterThan, decimalMinus, decimalSum, ZERO } from '@ui/lib/decimal'

/** Leverage and est. leveraged APR of the open position (current) and of the position after the action (future) */
export type EquityLeverage = {
  current: QueryProp<Decimal | null>
  future: QueryProp<Decimal | null>
  currentApr: QueryProp<Decimal | null>
  futureApr: QueryProp<Decimal | null>
  yieldMultiplier: QueryProp<Decimal | null>
}

const getApr = (position: UserState | null, oraclePrice: Decimal, { borrowApr }: MarketRates, yields: MarketYields) =>
  position && getEquityLeverageApr(position, oraclePrice, borrowApr, yields)

/**
 * Equity leverage, est. leveraged APR and yield multiplier of the open position and of the position after the action.
 * Returns null when it is not shown: disabled, or neither the open position nor the action borrows through the zap.
 */
export function useEquityLeverage(
  {
    params,
    futurePosition,
    isZapBorrow = false,
    debtDelta,
  }: {
    params: UserMarketParams
    futurePosition?: QueryProp<UserState | null>
    isZapBorrow?: boolean
    /** Debt change of the action, for the future borrow APR */
    debtDelta?: Decimal | null
  },
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
  const position = q(useUserState(params, isEnabled))
  const futurePositionQuery = futurePosition ?? DISABLED_Q
  const marketYields = useMarketYields(isEnabled)
  const currentRates = q(useMarketRates(params, isEnabled))
  const futureRates = futureOrCurrentQ(
    q(useMarketFutureRates({ chainId, marketId: params.marketId, debtDelta }, isEnabled)),
    currentRates,
  )
  const currentApr = combineQueries([position, oraclePrice, currentRates, marketYields], getApr)
  const equityLeverage = {
    current: combineQueries([position, oraclePrice], getEquityLeverage),
    future: combineQueries(
      [futurePositionQuery, oraclePrice],
      (position, oraclePrice) => position && getEquityLeverage(position, oraclePrice),
    ),
    currentApr,
    futureApr: combineQueries([futurePositionQuery, oraclePrice, futureRates, marketYields], getApr),
    yieldMultiplier: combineQueries([currentApr, marketYields], (apr, { collateralYieldApr }) =>
      getYieldMultiplier(apr, collateralYieldApr),
    ),
  }
  return isEnabled && (isZapBorrow || collateralEvents?.isZapLeveraged) ? equityLeverage : null
}

export function useCreateLoanEquityLeverage(params: CreateLoanFormQueryParams) {
  const { market } = useMarketContext()
  return useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(
        useCreateLoanExpectedCollateral(params, !!params.leverageEnabled),
        ({ totalCollateral }) => ({ collateral: totalCollateral, stablecoin: ZERO, debt: params.debt ?? ZERO }),
      ),
      isZapBorrow: !!params.leverageEnabled && hasZapV2(market),
      debtDelta: params.debt,
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
      (position, expected) => ({
        ...position,
        collateral: decimalSum(
          position.collateral,
          (expected ? expected.totalCollateral : params.userCollateral) ?? ZERO,
        ),
        debt: decimalSum(position.debt, params.debt ?? ZERO),
      }),
    ),
    isZapBorrow,
    debtDelta: params.debt,
  })
}

export const useRepayEquityLeverage = (
  params: RepayParams,
  { debt, debtDelta }: { debt: QueryProp<Decimal | null>; debtDelta: Decimal | undefined },
  enabled = true,
) =>
  useEquityLeverage(
    {
      params,
      futurePosition: combineQueries(
        [q(useUserState(params, enabled)), debt],
        // a partial repay keeps the borrowed tokens in the AMM: a partial repay from collateral reverts in soft liquidation
        (position, debt) =>
          debt &&
          (params.isFull
            ? { collateral: ZERO, stablecoin: ZERO, debt: ZERO }
            : { ...position, collateral: decimalMinus(position.collateral, params.stateCollateral ?? ZERO), debt }),
      ),
      debtDelta,
    },
    enabled,
  )

export const useAddCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(q(useUserState(params, enabled)), position => ({
        ...position,
        collateral: decimalSum(position.collateral, params.userCollateral ?? ZERO),
      })),
    },
    enabled,
  )

export const useRemoveCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(q(useUserState(params, enabled)), position => ({
        ...position,
        collateral: decimalGreaterThan(params.userCollateral ?? ZERO, position.collateral)
          ? ZERO
          : decimalMinus(position.collateral, params.userCollateral ?? ZERO),
      })),
    },
    enabled,
  )
