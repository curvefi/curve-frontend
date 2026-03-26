import BigNumber from 'bignumber.js'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { calculateLeverageCollateral } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { LoanActionInfoListProps } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib'
import { mapQuery, q, type Query, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

export type LeverageInfoFieldsOptions = {
  leverageEnabled: boolean
  leverageValue: Query<Decimal | null>
  prevLeverageValue: Query<Decimal | null>
  prevCollateral: QueryProp<Decimal | null>
  leverageTotalCollateral: QueryProp<Decimal | null>
  expected: Query<{ avgPrice?: Decimal }>
  priceImpact: Query<number | null>
  routes: MarketRoutes | undefined
  slippage: Decimal
  onSlippageChange: (newSlippage: Decimal) => void
  collateralDelta: Decimal | undefined
}
export const useLeverageInfoFields = ({
  leverageEnabled,
  routes,
  collateralDelta,
  slippage,
  onSlippageChange,
  priceImpact,
  leverageValue,
  prevLeverageValue,
  prevCollateral,
  leverageTotalCollateral,
  expected,
}: LeverageInfoFieldsOptions) =>
  leverageEnabled
    ? {
        leverageEnabled,
        leverageValue: q(leverageValue),
        prevLeverageValue: q(prevLeverageValue),
        prevLeverageCollateral: {
          data: calculateLeverageCollateral(prevCollateral.data, prevLeverageValue.data),
          ...combineQueryState(prevCollateral, prevLeverageValue),
        },
        leverageCollateral: {
          data: calculateLeverageCollateral(leverageTotalCollateral.data, leverageValue.data),
          ...combineQueryState(leverageTotalCollateral, leverageValue),
        },
        prevLeverageTotalCollateral: prevCollateral,
        leverageTotalCollateral,
        exchangeRate: mapQuery(expected, (data) => data.avgPrice ?? null),
        routes,
        slippage,
        onSlippageChange,
        priceImpact: q(priceImpact),
      }
    : ({
        prevCollateral,
        collateral: {
          data:
            collateralDelta &&
            prevCollateral.data &&
            decimal(new BigNumber(prevCollateral.data).plus(collateralDelta))!,
          ...combineQueryState(prevCollateral, expected),
        },
      } satisfies Partial<LoanActionInfoListProps>)
