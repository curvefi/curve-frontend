import type { RateCurveChartPoint } from '@/llamalend/widgets/MarketRateCurveChart'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ChartTooltipSeriesGroup, ChartTooltipSeriesRow, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@ui-kit/utils'

type RateCurveSeriesKey = keyof Omit<RateCurveChartPoint, 'utilization'>

type RateCurveTooltipProps = {
  datum: RateCurveChartPoint
  visibleSeries: LineSeriesConfig<RateCurveSeriesKey>[]
}

export const RateCurveTooltip = ({ datum, visibleSeries }: RateCurveTooltipProps) => (
  <ChartTooltipShell title={`${formatNumber(datum.utilization, 'percent.rate')} ${t`Utilization`}`}>
    <ChartTooltipSeriesGroup>
      {visibleSeries.map(activeSeries => (
        <ChartTooltipSeriesRow
          key={activeSeries.key}
          label={activeSeries.label}
          lineColor={activeSeries.color}
          dash={activeSeries.dash}
          value={formatNumber(datum[activeSeries.key], 'percent.rate')}
        />
      ))}
    </ChartTooltipSeriesGroup>
    <Typography variant="bodyXsRegular" sx={{ fontStyle: 'italic', whiteSpace: 'normal' }}>
      {t`Higher utilization can reduce immediately withdrawable liquidity.`}
    </Typography>
  </ChartTooltipShell>
)
