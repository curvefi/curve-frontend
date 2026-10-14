import type { VeCrvLock } from '@/dao/entities/vecrv-locks'
import { formatChartAxisNumber, getChartSignedValueColor } from '@evm-ui/shared/ui/Chart/chart.utils'
import { EChartsBarChart } from '@evm-ui/shared/ui/Chart/EChartsBarChart'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@primitives/date.utils'
import { PositiveAndNegativeBarChartTooltip } from './PositiveAndNegativeBarChartTooltip'

type PositiveAndNegativeBarChartProps = { data: VeCrvLock[]; height: number }

export const PositiveAndNegativeBarChart = ({ data, height }: PositiveAndNegativeBarChartProps) => {
  const theme = useTheme()

  return (
    <EChartsBarChart
      data={data}
      xKey="day"
      yKey="amount"
      yValue={datum => +datum.amount}
      barColor={datum => getChartSignedValueColor(theme, +datum.amount)}
      height={height}
      renderTooltip={PositiveAndNegativeBarChartTooltip}
      showVerticalGrid
      xTickFormatter={value => formatDate(value)}
      yTickFormatter={value => formatChartAxisNumber(+value)}
    />
  )
}
