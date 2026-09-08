import type { VeCrvFee } from '@/dao/entities/vecrv-fees'
import { EChartsBarChart, formatChartAxisNumber } from '@evm-ui/shared/ui/Chart'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@primitives/date.utils'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
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
