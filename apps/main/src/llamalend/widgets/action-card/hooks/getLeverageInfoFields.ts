import { isPositionLeveraged } from '@/llamalend/llama.utils'
import { calculateLeverageCollateral } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { LoanActionInfoListProps } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery, q, type Query, type QueryProp } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'
import type { EquityLeverage } from './useEquityLeverage'

type LeverageInfoFieldsOptions = {
  leverageEnabled: boolean | undefined
  collateralLeverageValue: Query<Decimal | null>
  prevCollateralLeverageValue: Query<Decimal | null>
  /** Beta: show the equity leverage instead of the collateral leverage */
  isEquityLeverage: boolean
  equityLeverage: EquityLeverage | null
  prevCollateral: QueryProp<Decimal | null>
  leverageTotalCollateral: QueryProp<Decimal | null>
  collateralDelta?: Decimal // only used when leverage is disabled, otherwise `leverageTotalCollateral` is used
}

export const getLeverageInfoFields = ({
  leverageEnabled,
  collateralDelta,
  collateralLeverageValue,
  prevCollateralLeverageValue,
  isEquityLeverage,
  equityLeverage,
  prevCollateral,
  leverageTotalCollateral,
}: LeverageInfoFieldsOptions) =>
  ({
    // we show the leverage info even when the leverage is disabled for the current action
    ...(leverageEnabled || isPositionLeveraged(prevCollateralLeverageValue.data) || equityLeverage
      ? {
          leverageEnabled: true,
          // the equity leverage row is hidden when `equityLeverage` is null
          ...(isEquityLeverage
            ? { leverageValue: equityLeverage?.future, prevLeverageValue: equityLeverage?.current }
            : { leverageValue: q(collateralLeverageValue), prevLeverageValue: q(prevCollateralLeverageValue) }),
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
          prevLeverageTotalCollateral: prevCollateral,
          leverageTotalCollateral,
        }
      : { prevCollateral, collateral: mapQuery(prevCollateral, prev => maybes([prev, collateralDelta], decimalSum)) }),
  }) satisfies Partial<LoanActionInfoListProps>
