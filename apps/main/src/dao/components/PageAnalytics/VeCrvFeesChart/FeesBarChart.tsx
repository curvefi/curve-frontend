import type { VeCrvFee } from '@/dao/entities/vecrv-fees'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { useCurrentDate } from '@ui-kit/hooks/useCurrentDate'
import { EChartsBarChart, formatChartAxisNumber } from '@ui-kit/shared/ui/Chart'
import { FeesBarChartTooltip } from './FeesBarChartTooltip'

type FeesBarChartProps = {
  data: VeCrvFee[]
  height?: number
}

export const FeesBarChart = ({ data, height = 500 }: FeesBarChartProps) => {
  const {
    design: { Color },
  } = useTheme()
  const currentDate = useCurrentDate()

  return (
    <EChartsBarChart
      data={data}
      xKey="timestamp"
      yKey="feesUsd"
      barColor={Color.Primary[300]}
      grid={{
        right: 20,
        left: 10,
      }}
      height={height}
      renderTooltip={({ datum }) => <FeesBarChartTooltip datum={datum} currentDate={currentDate} />}
      xTickFormatter={value => formatDate(value)}
      yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'dollar' })}
    />
  )
}
