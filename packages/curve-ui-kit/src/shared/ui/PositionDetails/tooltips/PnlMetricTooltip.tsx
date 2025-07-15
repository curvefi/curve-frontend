import { Stack, Typography } from '@mui/material'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { Pnl } from '@ui-kit/shared/ui/PositionDetails/BorrowPositionDetails'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type PnlMetricTooltipProps = {
  pnl: Pnl | undefined | null
}

export const PnlMetricTooltip = ({ pnl }: PnlMetricTooltipProps) => (
  <Stack gap={3} sx={{ maxWidth: '20rem' }}>
    <Typography variant="bodySRegular">{t`Profit and Loss (PnL) is calculated based on the value of the collateral at deposits minus the borrow costs and eventual losses if the position was in soft-liquidation.`}</Typography>

    <Stack gap={2} display="column" sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.sm }}>
      <Typography variant="bodySBold">{t`Breakdown`}</Typography>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Collateral value`}</Typography>
        <Typography variant="bodySBold">
          {pnl?.currentPositionValue ? formatNumber(pnl.currentPositionValue, { ...FORMAT_OPTIONS.USD }) : '-'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Value at deposit`}</Typography>
        <Typography variant="bodySBold">
          {pnl?.depositedValue ? formatNumber(pnl.depositedValue, { ...FORMAT_OPTIONS.USD }) : '-'}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap={5}>
        <Typography variant="bodySRegular">{t`Profit/Loss`}</Typography>
        <Stack direction="row" gap={2}>
          <Typography variant="bodySBold">
            {pnl?.currentProfit ? formatNumber(pnl.currentProfit, { ...FORMAT_OPTIONS.USD }) : '-'}
          </Typography>
          {pnl?.currentPositionValue && (
            <Typography variant="bodySRegular">{`(${formatNumber(pnl.currentPositionValue, { ...FORMAT_OPTIONS.PERCENT })})`}</Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  </Stack>
)
