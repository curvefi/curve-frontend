import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { EChartsBarChart } from '@evm-ui/shared/ui/Chart'
import { formatNumber } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import { useTheme } from '@mui/material/styles'
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
