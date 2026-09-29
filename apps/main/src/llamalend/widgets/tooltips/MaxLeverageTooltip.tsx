import {
  LeverageEquation,
  Equation,
  Fraction,
} from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Stack } from '@mui/material'
import { TooltipWrapper, TooltipDescription } from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const MaxLeverageTooltip = () => {
  const beta = useNewLlamalendHealth()
  return (
    <TooltipWrapper>
      {beta ? (
        <>
          <TooltipDescription
            text={t`Theoretical initial collateral exposure over equity at this market's maximum loan-to-value ratio (Max LTV). It assumes no conversion into borrowed assets and excludes swap costs and price movement. It is not a live position.`}
          />
          <LeverageEquation />
          <Equation>
            {t`Max leverage`}
            {' = '}
            <Fraction numerator="100%" denominator={t`100% − Max LTV`} />
          </Equation>
          <TooltipDescription text={t`Max LTV = maximum loan-to-value ratio.`} />
        </>
      ) : (
        <>
          <TooltipDescription
            text={t`Theoretical maximum leverage achievable in this market, based on the Max Loan-to-Value (LTV) ratio.`}
          />
          <TooltipDescription text={t`Calculated as: 1 / (1 - Max LTV)`} />
          <TooltipDescription text={t`For example, with a Max LTV of 90%, the max leverage is ~10x.`} />
        </>
      )}
      <Stack sx={{ padding: Spacing.sm, bgcolor: t => t.design.Layer[2].Fill }}>
        <TooltipDescription
          text={t`⚠️ Higher leverage increases risk — especially in volatile markets or when collateral enters the liquidation band.`}
        />
      </Stack>
    </TooltipWrapper>
  )
}
