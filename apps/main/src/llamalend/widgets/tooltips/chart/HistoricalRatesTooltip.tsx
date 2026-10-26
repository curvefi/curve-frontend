import type { RateChartPoint } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import {
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
  ChartTooltipShell,
} from '@ui/features/charts/ChartTooltipComponents'
import type { LineSeriesConfig } from '@ui/features/charts/EChartsLineChart'

type RateSeriesKey = keyof Omit<RateChartPoint, 'timestamp'>

type HistoricalRatesTooltipProps = { datum: RateChartPoint; visibleSeries: LineSeriesConfig<RateSeriesKey>[] }

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
