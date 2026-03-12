import { TOOLTIP_MAX_WIDTH, TOOLTIP_MAX_WIDTH_MOBILE } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusd-yield'
import { Paper, Stack, Typography } from '@mui/material'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { LegendLine } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const lineLabels: Record<YieldKeys, string> = {
  apyProjected: t`APY`,
  proj_apy_7d_avg: t`7-day MA APY`,
  proj_apy_total_avg: t`Average APY`,
}

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

type RevenueChartTooltipProps = {
  datum: ScrvUsdYieldWithAverages
  visibleSeries: LineSeriesConfig<YieldKeys>[]
}

export const RevenueChartTooltip = ({ datum, visibleSeries }: RevenueChartTooltipProps) => {
  const { timestamp } = datum

  return (
    <Paper
      sx={{
        backgroundColor: (theme) => theme.design.Layer[3].Fill,
        padding: Spacing.md,
        width: { mobile: TOOLTIP_MAX_WIDTH_MOBILE, tablet: TOOLTIP_MAX_WIDTH },
      }}
      elevation={2}
    >
      <Typography variant="bodyMBold">{formatDate(timestamp, 'long')}</Typography>
      <Stack
        direction="column"
        sx={{ marginTop: Spacing.sm, padding: Spacing.sm, gap: 1, backgroundColor: (theme) => theme.design.Layer[2].Fill }}
      >
        {visibleSeries.map((series) => (
          <DataSet
            key={series.key}
            label={lineLabels[series.key]}
            value={format(datum[series.key])}
            lineColor={series.color}
            dash={series.dash}
          />
        ))}
      </Stack>
    </Paper>
  )
}
