import type { EquityMetrics } from '@/llamalend/hooks/useEquityLeverage'
import { isPositionLeveraged } from '@/llamalend/llama.utils'
import { calculateLeverageCollateral } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { LoanActionInfoListProps } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery, q, type Query, type QueryProp } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'

type LeverageInfoFieldsOptions = {
  leverageEnabled: boolean | undefined
  collateralLeverageValue: Query<Decimal | null>
  prevCollateralLeverageValue: Query<Decimal | null>
  isEquityLeverage: boolean
  equityLeverage: EquityMetrics
  prevCollateral: QueryProp<Decimal | null>
  leverageTotalCollateral: QueryProp<Decimal | null>
  collateralDelta?: Decimal // only used when leverage is disabled, otherwise `leverageTotalCollateral` is used
}

/** @deprecated Collateral leverage rows, replaced by the equity leverage */
const getCollateralLeverageFields = ({
  collateralLeverageValue,
  prevCollateralLeverageValue,
  prevCollateral,
  leverageTotalCollateral,
}: LeverageInfoFieldsOptions) => ({
  leverageValue: q(collateralLeverageValue),
  prevLeverageValue: q(prevCollateralLeverageValue),
  collateralLeverageValue: q(collateralLeverageValue),
  prevCollateralLeverageValue: q(prevCollateralLeverageValue),
  prevLeverageCollateral: {
    data: calculateLeverageCollateral(prevCollateral.data, prevCollateralLeverageValue.data),
    ...combineQueryState(prevCollateral, prevCollateralLeverageValue),
  },
  leverageCollateral: {
    data: calculateLeverageCollateral(leverageTotalCollateral.data, collateralLeverageValue.data),
    ...combineQueryState(leverageTotalCollateral, collateralLeverageValue),
  },
})

export const getLeverageInfoFields = (options: LeverageInfoFieldsOptions) => {
  const {
    leverageEnabled,
    collateralDelta,
    prevCollateralLeverageValue,
    isEquityLeverage,
    equityLeverage: { leverage, carryApr },
    prevCollateral,
    leverageTotalCollateral,
  } = options
  return {
    // we show the leverage info even when the leverage is disabled for the current action
    ...(leverageEnabled || (isEquityLeverage ? leverage : isPositionLeveraged(prevCollateralLeverageValue.data))
      ? {
          leverageEnabled: true,
          ...(isEquityLeverage
            ? leverage && { leverageValue: leverage.future, prevLeverageValue: leverage.current }
            : getCollateralLeverageFields(options)),
          prevLeverageTotalCollateral: prevCollateral,
          leverageTotalCollateral,
        }
      : { prevCollateral, collateral: mapQuery(prevCollateral, prev => maybes([prev, collateralDelta], decimalSum)) }),
    ...(carryApr && { carryApr: carryApr.future, prevCarryApr: carryApr.current }),
  } satisfies Partial<LoanActionInfoListProps>
}
