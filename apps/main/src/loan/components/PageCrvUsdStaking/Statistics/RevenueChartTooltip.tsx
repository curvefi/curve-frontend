import {
  ChartTooltipShell,
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
} from '@/llamalend/widgets/tooltips/chart/ChartTooltipComponents'
import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusd-yield'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import type { LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@ui-kit/utils'

const lineLabels: Record<YieldKeys, string> = {
  apyProjected: t`APY`,
  proj_apy_7d_avg: t`7-day MA APY`,
  proj_apy_total_avg: t`Average APY`,
}

const format = (value: number) => formatNumber(value, { unit: 'percentage', abbreviate: false })

type RevenueChartTooltipProps = {
  datum: ScrvUsdYieldWithAverages
  visibleSeries: LineSeriesConfig<YieldKeys>[]
}

export const RevenueChartTooltip = ({ datum, visibleSeries }: RevenueChartTooltipProps) => (
  <ChartTooltipShell title={formatDate(datum.timestamp, 'long')}>
    <ChartTooltipSeriesGroup>
      {visibleSeries.map((series) => (
        <ChartTooltipSeriesRow
          key={series.key}
          label={lineLabels[series.key]}
          value={format(datum[series.key])}
          lineColor={series.color}
          dash={series.dash}
        />
      ))}
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
