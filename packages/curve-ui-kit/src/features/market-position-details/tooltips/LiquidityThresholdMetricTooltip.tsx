import { Stack, Typography } from '@mui/material'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { BandRange, LiquidationRange } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type LiquidityThresholdTooltipProps = {
  liquidationRange: LiquidationRange | undefined | null
  rangeToLiquidation: number | undefined | null
  bandRange: BandRange | undefined | null
}

const UnavailableNotation = '-'

export const LiquidityThresholdTooltip = ({
  liquidationRange,
  rangeToLiquidation,
  bandRange,
}: LiquidityThresholdTooltipProps) => (
  <Stack gap={3} sx={{ maxWidth: '20rem' }}>
    <Typography variant="bodySRegular">
      {t`The price at which your position enters the liquidation zone  and your collateral starts to be eroded by LLAMMA. The distance to LT indicates the distance between the current price and the LT.`}
    </Typography>
    <Stack gap={2} display="column" sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.sm }}>
      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Distance to LT`}</Typography>
        <Typography variant="bodySBold">
          {rangeToLiquidation ? formatNumber(rangeToLiquidation, { ...FORMAT_OPTIONS.PERCENT }) : UnavailableNotation}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Liquidation threshold`}</Typography>
        <Typography variant="bodySBold">
          {liquidationRange?.value?.[1]
            ? formatNumber(liquidationRange.value[1], { ...FORMAT_OPTIONS.USD })
            : UnavailableNotation}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Liquidation lower bound`}</Typography>
        <Typography variant="bodySBold">
          {liquidationRange?.value?.[0]
            ? formatNumber(liquidationRange.value[0], { ...FORMAT_OPTIONS.USD })
            : UnavailableNotation}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Band range`}</Typography>
        <Typography variant="bodySBold">
          {bandRange?.value ? `${bandRange.value[0]} to ${bandRange.value[1]}` : UnavailableNotation}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
)
