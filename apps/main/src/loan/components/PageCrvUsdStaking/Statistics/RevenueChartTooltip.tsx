import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { TOOLTIP_MAX_WIDTH, TOOLTIP_MAX_WIDTH_MOBILE } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusd-yield'
import { Paper, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { LegendLine } from '@ui-kit/shared/ui/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const DataSet = ({
  label,
  value,
  lineColor,
  dash,
}: {
  label: string
  value: string
  lineColor: string
  dash?: string
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={2} alignItems="center">
      <LegendLine color={lineColor} dash={dash} />
      <Typography variant="bodySRegular">{label}</Typography>
    </Stack>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

const format = (value: number) => formatNumber(value, { unit: 'percentage', abbreviate: false })

export const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  const {
    design: { Color, Layer },
  } = useTheme()

  if (!active || !payload || !payload.length) {
    return null
  }

  const { timestamp, apyProjected, proj_apy_7d_avg, proj_apy_total_avg } = payload[0]
    .payload as ScrvUsdYieldWithAverages

  return (
    <Paper
      sx={{
        backgroundColor: Layer[3].Fill,
        padding: Spacing.md,
        width: { mobile: TOOLTIP_MAX_WIDTH_MOBILE, tablet: TOOLTIP_MAX_WIDTH },
      }}
      elevation={2}
    >
      <Typography variant="bodyMBold">{formatDate(timestamp, 'long')}</Typography>
      <Stack
        direction="column"
        sx={{ marginTop: Spacing.sm, padding: Spacing.sm, gap: 1, backgroundColor: Layer[2].Fill }}
      >
        <DataSet label={t`APY`} value={format(apyProjected)} lineColor={Color.Primary[500]} />
        <DataSet label={t`7-day MA APY`} value={format(proj_apy_7d_avg)} lineColor={Color.Secondary[500]} dash="2 2" />
        <DataSet label={t`Average APY`} value={format(proj_apy_total_avg)} lineColor={Color.Tertiary[400]} dash="4 4" />
      </Stack>
    </Paper>
  )
}
