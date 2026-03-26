import type { RateCurveChartPoint } from '@/llamalend/widgets/MarketRateCurveChart'
import {
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
  ChartTooltipShell,
} from '@/llamalend/widgets/tooltips/chart/ChartTooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { formatPercent } from '@ui-kit/utils'

type RateCurveSeriesKey = keyof Omit<RateCurveChartPoint, 'utilization'>

type RateCurveTooltipProps = {
  datum: RateCurveChartPoint
  visibleSeries: LineSeriesConfig<RateCurveSeriesKey>[]
}

export const RateCurveTooltip = ({ datum, visibleSeries }: RateCurveTooltipProps) => (
  <ChartTooltipShell title={`${formatPercent(datum.utilization)} ${t`Utilization`}`}>
    <ChartTooltipSeriesGroup>
      {visibleSeries.map((activeSeries) => (
        <ChartTooltipSeriesRow
          key={activeSeries.key}
          label={activeSeries.label}
          lineColor={activeSeries.color}
          dash={activeSeries.dash}
          value={formatPercent(datum[activeSeries.key])}
        />
      ))}
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
