import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import { RevenueChartTooltip } from '@/loan/components/PageCrvUsdStaking/Statistics/RevenueChartTooltip'
import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusd-yield'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { EChartsLineChart, type LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { formatNumber } from '@ui-kit/utils'

type Props = { data: ScrvUsdYieldWithAverages[]; height?: number; visibleSeries?: YieldKeys[] }

export const RevenueLineChart = ({ data, height = 400, visibleSeries }: Props) => {
  const {
    design: { Color },
  } = useTheme()

  const series: LineSeriesConfig<YieldKeys>[] = [
    {
      key: 'apyProjected',
      label: priceLineLabels.apyProjected.label,
      color: Color.Primary[500],
      dash: priceLineLabels.apyProjected.dash,
    },
    {
      key: 'proj_apy_7d_avg',
      label: priceLineLabels.proj_apy_7d_avg.label,
      color: Color.Secondary[500],
      dash: priceLineLabels.proj_apy_7d_avg.dash,
    },
    {
      key: 'proj_apy_total_avg',
      label: priceLineLabels.proj_apy_total_avg.label,
      color: Color.Tertiary[400],
      dash: priceLineLabels.proj_apy_total_avg.dash,
    },
  ]

  return (
    <EChartsLineChart<ScrvUsdYieldWithAverages, YieldKeys, 'timestamp'>
      data={data}
      height={height}
      xKey="timestamp"
      yAxisDataKey="apyProjected"
      series={series}
      visibleSeries={visibleSeries}
      xTickFormatter={(value) => formatDate(value)}
      yTickFormatter={(value) => formatNumber(value, { unit: 'percentage', abbreviate: false, decimals: 0 })}
      renderTooltip={({ datum, visibleSeries }) => <RevenueChartTooltip datum={datum} visibleSeries={visibleSeries} />}
    />
  )
}
