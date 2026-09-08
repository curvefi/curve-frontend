import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusd-yield.query'
import { ChartTooltipShell, ChartTooltipSeriesGroup, ChartTooltipSeriesRow } from '@evm-ui/shared/ui/Chart'
import type { LineSeriesConfig } from '@evm-ui/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import { t } from '@ui/lib/i18n'

const lineLabels: Record<YieldKeys, string> = {
  apyProjected: t`APY`,
  proj_apy_7d_avg: t`7-day MA APY`,
  proj_apy_total_avg: t`Average APY`,
}

const format = (value: number) => formatNumber(value, 'percent.value')

type RevenueChartTooltipProps = {
  datum: ScrvUsdYieldWithAverages
  visibleSeries: LineSeriesConfig<YieldKeys>[]
}

export const RevenueChartTooltip = ({ datum, visibleSeries }: RevenueChartTooltipProps) => (
  <ChartTooltipShell title={formatDate(datum.timestamp, 'long')}>
    <ChartTooltipSeriesGroup>
      {visibleSeries.map(series => (
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
