import type { BorrowAprChartPoint } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { Paper, Stack, Typography } from '@mui/material'
import { formatDate } from '@ui/utils'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { LegendLine } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const TOOLTIP_MAX_WIDTH = '20.5rem'
const TOOLTIP_MAX_WIDTH_MOBILE = '16.4rem' // 80% of TOOLTIP_MAX_WIDTH

type BorrowAprSeriesKey = keyof Omit<BorrowAprChartPoint, 'timestamp'>

type HistoricalRatesTooltipProps = {
  datum: BorrowAprChartPoint
  visibleSeries: LineSeriesConfig<BorrowAprSeriesKey>[]
}

export const HistoricalRatesTooltip = ({ datum, visibleSeries }: HistoricalRatesTooltipProps) => (
  <Paper
    sx={{
      backgroundColor: (theme) => theme.design.Layer[3].Fill,
      padding: Spacing.md,
      width: { mobile: TOOLTIP_MAX_WIDTH_MOBILE, tablet: TOOLTIP_MAX_WIDTH },
    }}
    elevation={2}
  >
    <Typography variant="bodyMBold">{formatDate(datum.timestamp, 'long')}</Typography>
    <Stack
      direction="column"
      sx={{
        marginTop: Spacing.sm,
        padding: Spacing.sm,
        gap: 1,
        backgroundColor: (theme) => theme.design.Layer[2].Fill,
      }}
    >
      {visibleSeries.map((activeSeries) => (
        <Stack key={activeSeries.key} direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <LegendLine color={activeSeries.color} dash={activeSeries.dash} />
            <Typography variant="bodySRegular">{activeSeries.label}</Typography>
          </Stack>
          <Typography variant="bodySBold">
            {formatNumber(datum[activeSeries.key], { unit: 'percentage', abbreviate: false })}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Paper>
)
