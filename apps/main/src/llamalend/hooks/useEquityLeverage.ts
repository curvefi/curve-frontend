import {
  getCarryApr,
  getEquityLeverage,
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

/** Leverage of the open position (current) and of the position after the action (future) */
export type EquityLeverage = {
  current: QueryProp<Decimal | null>
  future: QueryProp<Decimal | null>
  /** The leverage the open position opened at */
  opening: QueryProp<Decimal | null>
}

/** Carry APR of the open position (current) and of the position after the action (future) */
export type CarryApr = {
  current: QueryProp<Decimal | null>
  future: QueryProp<Decimal | null>
  yieldMultiplier: QueryProp<Decimal | null>
}

/** Each is null when it is not shown */
export type EquityMetrics = { leverage: EquityLeverage | null; carryApr: CarryApr | null }

const getPositionCarryApr = (
  position: UserState | null,
  oraclePrice: Decimal,
  { borrowApr }: MarketRates,
  yields: MarketYields,
) => position && getCarryApr(position, oraclePrice, borrowApr, yields)

/**
 * Equity leverage, carry APR and yield multiplier of the open position and of the position after the action.
 * Both are null when disabled. The leverage is also null unless the open position or the action borrows through the zap.
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
): EquityMetrics {
  const isEnabled = useLlamalendEquityLeverage() && enabled
  const { marketType, controllerAddress, chainId, userAddress, tokens } = useMarketContext()
  const collateralEvents = useUserCollateralEvents({ app: marketType, controllerAddress, chainId, userAddress, tokens })
  const oraclePrice = q(useMarketOraclePrice(params, isEnabled))
  const position = q(useUserState(params, isEnabled))
  const futurePositionQuery = futurePosition ?? DISABLED_Q
  const marketYields = useMarketYields(isEnabled)
  const currentRates = q(useMarketRates(params, isEnabled))
  const futureRates = futureOrCurrentQ(
    q(useMarketFutureRates({ ...params, chainId, debtDelta }, isEnabled)),
    currentRates,
  )
  const currentCarryApr = combineQueries([position, oraclePrice, currentRates, marketYields], getPositionCarryApr)
  return {
    leverage:
      isEnabled && (isZapBorrow || collateralEvents.data?.isZapLeveraged)
        ? {
            current: combineQueries([position, oraclePrice], getEquityLeverage),
            future: combineQueries(
              [futurePositionQuery, oraclePrice],
              (position, oraclePrice) => position && getEquityLeverage(position, oraclePrice),
            ),
            opening: mapQuery(collateralEvents, ({ openingLeverage }) => openingLeverage),
          }
        : null,
    carryApr: isEnabled
      ? {
          current: currentCarryApr,
          future: combineQueries([futurePositionQuery, oraclePrice, futureRates, marketYields], getPositionCarryApr),
          yieldMultiplier: combineQueries([currentCarryApr, marketYields], (apr, { collateralYieldApr }) =>
            getYieldMultiplier(apr, collateralYieldApr),
          ),
        }
      : null,
  }
}

export function useCreateLoanEquityLeverage(params: CreateLoanFormQueryParams) {
  const { market } = useMarketContext()
  const expectedCollateral = useCreateLoanExpectedCollateral(params, !!params.leverageEnabled)
  return useEquityLeverage({
    params,
    futurePosition: mapQuery(
      params.leverageEnabled
        ? mapQuery(expectedCollateral, ({ totalCollateral }) => totalCollateral)
        : constQ(params.userCollateral ?? ZERO),
      collateral => ({ collateral, convertedBorrowed: ZERO, debt: params.debt ?? ZERO }),
    ),
    isZapBorrow: !!params.leverageEnabled && hasZapV2(market),
    debtDelta: params.debt,
  })
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
            ? { collateral: ZERO, convertedBorrowed: ZERO, debt: ZERO }
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
