import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const MaxLeverageTooltip = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Theoretical maximum leverage achievable in this market, based on the Max Loan-to-Value (LTV) ratio.`}
    />
    <TooltipDescription text={t`Calculated as: 1 / (1 - Max LTV)`} />
    <TooltipDescription text={t`For example, with a Max LTV of 90%, the max leverage is ~10x.`} />
    <Stack padding={Spacing.sm} sx={{ bgcolor: (t) => t.design.Layer[2].Fill }}>
      <TooltipDescription
        text={t`⚠️ Higher leverage increases risk — especially in volatile markets or when collateral enters the liquidation band.`}
      />
    </Stack>
  </TooltipWrapper>
)
