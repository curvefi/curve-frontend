import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { isPositionLeveraged } from '@/llamalend/llama.utils'
import { calculateLeverageCollateral } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { LoanActionInfoListProps } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib'
import { mapQuery, q, type Query, type QueryProp } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'

export type LeverageInfoFieldsOptions = {
  leverageEnabled: boolean
  leverageValue: Query<Decimal | null>
  prevLeverageValue: Query<Decimal | null>
  prevCollateral: QueryProp<Decimal | null>
  leverageTotalCollateral: QueryProp<Decimal | null>
  expected?: Query<{ avgPrice?: Decimal }>
  priceImpact?: Query<Decimal | null>
  routes?: MarketRoutes | undefined
  slippage?: Decimal
  onSlippageChange?: (newSlippage: Decimal) => void
  collateralDelta: Decimal | undefined // only used when leverage is disabled, otherwise `leverageTotalCollateral` is used
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
  ({
    // we show the leverage info even when the leverage is disabled for the current action
    ...(leverageEnabled || isPositionLeveraged(prevLeverageValue.data)
      ? {
          leverageEnabled: true,
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
          ...(leverageEnabled && {
            exchangeRate: expected && mapQuery(expected, (data) => data.avgPrice ?? null),
            routes,
            slippage,
            onSlippageChange,
            priceImpact: priceImpact && q(priceImpact),
          }),
        }
      : {
          prevCollateral,
          collateral: mapQuery(prevCollateral, (prev) => prev && collateralDelta && decimalSum(prev, collateralDelta)!),
        }),
  }) satisfies Partial<LoanActionInfoListProps>
