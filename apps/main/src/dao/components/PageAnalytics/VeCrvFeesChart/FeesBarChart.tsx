import type { VeCrvFee } from '@/dao/entities/vecrv-fees'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { useCurrentDate } from '@ui-kit/hooks/useCurrentDate'
import { EChartsBarChart, formatChartAxisNumber } from '@ui-kit/shared/ui/Chart'
import { FeesBarChartTooltip } from './FeesBarChartTooltip'

type FeesBarChartProps = {
  data: VeCrvFee[]
  height: number
}

export const FeesBarChart = ({ data, height }: FeesBarChartProps) => {
  const currentDate = useCurrentDate()

  return (
    <EChartsBarChart
      data={data}
      xKey="timestamp"
      yKey="feesUsd"
      barColor={useTheme().design.Chart.Lines[1]}
      height={height}
      renderTooltip={({ datum }) => <FeesBarChartTooltip datum={datum} currentDate={currentDate} />}
      xTickFormatter={value => formatDate(value)}
      yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'dollar' })}
    />
  )
}
