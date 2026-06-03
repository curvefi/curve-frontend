import type { RateChartPoint } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { formatDate } from '@ui/utils'
import { ChartTooltipSeriesGroup, ChartTooltipSeriesRow, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@ui-kit/utils'

type RateSeriesKey = keyof Omit<RateChartPoint, 'timestamp'>

type HistoricalRatesTooltipProps = {
  datum: RateChartPoint
  visibleSeries: LineSeriesConfig<RateSeriesKey>[]
}

export const HistoricalRatesTooltip = ({ datum, visibleSeries }: HistoricalRatesTooltipProps) => (
  <ChartTooltipShell title={formatDate(datum.timestamp, 'long')}>
    <ChartTooltipSeriesGroup>
      {visibleSeries.map(activeSeries => (
        <ChartTooltipSeriesRow
          key={activeSeries.key}
          label={activeSeries.label}
          lineColor={activeSeries.color}
          dash={activeSeries.dash}
          value={formatNumber(datum[activeSeries.key], 'percent.value')}
        />
      ))}
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
