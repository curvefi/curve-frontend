import type { RateChartPoint } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartTooltipSeriesGroup, ChartTooltipSeriesRow, ChartTooltipShell } from '@evm-ui/shared/ui/Chart'
import type { LineSeriesConfig } from '@evm-ui/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'

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
          value={formatNumber(datum[activeSeries.key], 'percent.rate')}
        />
      ))}
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
