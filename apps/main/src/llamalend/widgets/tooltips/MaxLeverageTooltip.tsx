import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import { Stack } from '@mui/material'
import { TooltipWrapper, TooltipDescription } from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const MaxLeverageTooltip = () => (
  <TooltipWrapper>
    {useLlamalendEquityLeverage() ? (
      <>
        <TooltipDescription
          text={t`Highest leverage you can open in this market with the leverage option, at the minimum number of bands.`}
        />
        <TooltipDescription text={t`Calculated as: collateral value / (collateral value - debt)`} />
        <TooltipDescription text={t`The swap is priced at the oracle price, so fees and price impact can lower it.`} />
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
