import type { CrvUsdPriceChartPoint } from '@/llamalend/widgets/CrvUsdPriceChart'
import {
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
  ChartTooltipShell,
} from '@/llamalend/widgets/tooltips/chart/ChartTooltipComponents'
import { formatDate } from '@ui/utils'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@ui-kit/utils'

type PriceSeriesKey = keyof Omit<CrvUsdPriceChartPoint, 'timestamp'>

type CrvUsdPriceTooltipProps = {
  datum: CrvUsdPriceChartPoint
  visibleSeries: LineSeriesConfig<PriceSeriesKey>[]
}

export const CrvUsdPriceTooltip = ({ datum, visibleSeries }: CrvUsdPriceTooltipProps) => (
  <ChartTooltipShell title={formatDate(datum.timestamp, 'long')}>
    <ChartTooltipSeriesGroup>
      {visibleSeries.map(activeSeries => (
        <ChartTooltipSeriesRow
          key={activeSeries.key}
          label={activeSeries.label}
          lineColor={activeSeries.color}
          dash={activeSeries.dash}
          value={formatNumber(datum[activeSeries.key], {
            unit: 'dollar',
            abbreviate: false,
            decimals: 4,
            minimumFractionDigits: 4,
          })}
        />
      ))}
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
