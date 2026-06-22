import type { VeCrvLock } from '@/dao/entities/vecrv-locks'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { EChartsBarChart, formatChartAxisNumber, getChartSignedValueColor } from '@ui-kit/shared/ui/Chart'
import { PositiveAndNegativeBarChartTooltip } from './PositiveAndNegativeBarChartTooltip'

type PositiveAndNegativeBarChartProps = {
  data: VeCrvLock[]
  height?: number
}

export const PositiveAndNegativeBarChart = ({ data, height = 500 }: PositiveAndNegativeBarChartProps) => {
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
