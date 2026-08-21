import { isPositionLeveraged } from '@/llamalend/llama.utils'
import { calculateLeverageCollateral } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { LoanActionInfoListProps } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import { combineQueryState } from '@evm-ui/lib'
import { mapQuery, q, type Query, type QueryProp } from '@evm-ui/types/util'
import { decimalSum } from '@evm-ui/utils'
import type { PriceImpact } from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'

type LeverageInfoFieldsOptions = {
  leverageEnabled: boolean | undefined
  leverageValue: Query<Decimal | null>
  prevLeverageValue: Query<Decimal | null>
  prevCollateral: QueryProp<Decimal | null>
  leverageTotalCollateral: QueryProp<Decimal | null>
  expected?: Query<{ avgPrice?: Decimal }>
  priceImpact?: Query<PriceImpact | Decimal | null>
  slippage?: Decimal
  collateralDelta: Decimal | undefined // only used when leverage is disabled, otherwise `leverageTotalCollateral` is used
}

export const getLeverageInfoFields = ({
  leverageEnabled,
  collateralDelta,
  slippage,
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
            exchangeRate: expected && mapQuery(expected, data => data.avgPrice ?? null),
            slippage,
            priceImpact: priceImpact && q(priceImpact),
          }),
        }
      : {
          prevCollateral,
          collateral: mapQuery(prevCollateral, prev => maybes([prev, collateralDelta], decimalSum)),
        }),
  }) satisfies Partial<LoanActionInfoListProps>
