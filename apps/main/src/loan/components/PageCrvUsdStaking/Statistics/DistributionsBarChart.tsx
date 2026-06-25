import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { EChartsBarChart } from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'
import { DistributionsChartTooltip } from './DistributionsChartTooltip'

type RevenueDistributionsBarChartProps = { data: ScrvUsdRevenue | null; height: number }

export const RevenueDistributionsBarChart = ({ data, height }: RevenueDistributionsBarChartProps) => {
  const {
    design: { Color },
  } = useTheme()
  const barColor = Color.Secondary[500]

  return (
    <EChartsBarChart
      data={data?.epochs ?? []}
      xKey="endDate"
      yKey="weeklyRevenue"
      barColor={barColor}
      height={height}
      renderTooltip={DistributionsChartTooltip}
      xTickFormatter={time => formatDate(time)}
      yTickFormatter={value => formatNumber(+value, 'usd.notional')}
    />
  )
}
