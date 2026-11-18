import type { EquityLeverage } from '@/llamalend/hooks/useEquityLeverage'
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
  equityLeverage: EquityLeverage
  prevCollateral: QueryProp<Decimal | null>
  leverageTotalCollateral: QueryProp<Decimal | null>
  collateralDelta?: Decimal // only used when leverage is disabled, otherwise `leverageTotalCollateral` is used
}

const getLeverageTotals = ({ prevCollateral, leverageTotalCollateral }: LeverageInfoFieldsOptions) => ({
  leverageEnabled: true,
  prevLeverageTotalCollateral: prevCollateral,
  leverageTotalCollateral,
})

const getCollateralFields = ({ prevCollateral, collateralDelta }: LeverageInfoFieldsOptions) => ({
  prevCollateral,
  collateral: mapQuery(prevCollateral, prev => maybes([prev, collateralDelta], decimalSum)),
})

const getEquityLeverageFields = (options: LeverageInfoFieldsOptions) => {
  const {
    leverageEnabled,
    equityLeverage: { isZapLeveraged, current, future },
  } = options
  return leverageEnabled || isZapLeveraged.data
    ? {
        ...getLeverageTotals(options),
        ...(isZapLeveraged.data && { leverageValue: future, prevLeverageValue: current }),
      }
    : getCollateralFields(options)
}

/** @deprecated Collateral leverage, replaced by the equity leverage */
const getLegacyCollateralLeverageFields = (options: LeverageInfoFieldsOptions) => {
  const {
    leverageEnabled,
    collateralLeverageValue,
    prevCollateralLeverageValue,
    prevCollateral,
    leverageTotalCollateral,
  } = options
  return leverageEnabled || isPositionLeveraged(prevCollateralLeverageValue.data)
    ? {
        ...getLeverageTotals(options),
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
      }
    : getCollateralFields(options)
}

export const getLeverageInfoFields = (options: LeverageInfoFieldsOptions) =>
  (options.isEquityLeverage
    ? getEquityLeverageFields(options)
    : getLegacyCollateralLeverageFields(options)) satisfies Partial<LoanActionInfoListProps>
