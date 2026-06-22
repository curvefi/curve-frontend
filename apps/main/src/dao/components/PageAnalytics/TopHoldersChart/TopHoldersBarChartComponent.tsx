import { useCallback, useMemo } from 'react'
import type { VeCrvHolder } from '@/dao/entities/vecrv-holders'
import type { TopHoldersSortBy } from '@/dao/types/dao.types'
import { formatHolderName } from '@/dao/utils'
import { useTheme } from '@mui/material/styles'
import { createChartSeriesColorScale, EChartsBarChart, formatChartAxisNumber } from '@ui-kit/shared/ui/Chart'
import { TopHoldersBarChartTooltip as CustomTooltip } from './TopHoldersBarChartTooltip'

type TopHoldersBarChartProps = {
  height: number
  data: VeCrvHolder[]
  filter: TopHoldersSortBy
}

const getValueByFilter: Record<TopHoldersSortBy, (datum: VeCrvHolder) => number> = {
  locked: datum => +datum.locked,
  weight: datum => +datum.weight,
  weightRatio: datum => +datum.weightRatio,
}

export const TopHoldersBarChart = ({ height, data, filter }: TopHoldersBarChartProps) => {
  const theme = useTheme()
  const barColors = useMemo(() => createChartSeriesColorScale(theme), [theme])
  const getBarColor = useCallback((_: VeCrvHolder, index: number) => barColors[index % barColors.length], [barColors])

  return (
    <EChartsBarChart
      data={data}
      xKey="user"
      yKey={filter}
      yValue={getValueByFilter[filter]}
      barColor={getBarColor}
      height={height}
      renderTooltip={CustomTooltip}
      xAxisLabelRotate={-45}
      xAxisInterval={0}
      xTickFormatter={value => formatHolderName(String(value))}
      yTickFormatter={value =>
        filter === 'weightRatio' ? formatChartAxisNumber(+value, { unit: 'percentage' }) : formatChartAxisNumber(+value)
      }
    />
  )
}
