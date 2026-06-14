import { useCallback, useMemo } from 'react'
import type { VeCrvHolder } from '@/dao/entities/vecrv-holders'
import type { TopHoldersSortBy } from '@/dao/types/dao.types'
import { formatHolderName } from '@/dao/utils'
import { useTheme } from '@mui/material/styles'
import { createChartSeriesColorScale, EChartsBarChart, formatChartAxisNumber } from '@ui-kit/shared/ui/Chart'
import { TopHoldersBarChartTooltip as CustomTooltip } from './TopHoldersBarChartTooltip'

type TopHoldersBarChartProps = {
  data: VeCrvHolder[]
  filter: TopHoldersSortBy
}

export const TopHoldersBarChart = ({ data, filter }: TopHoldersBarChartProps) => {
  const height = 300
  const theme = useTheme()
  const barColors = useMemo(() => createChartSeriesColorScale(theme), [theme])
  const getBarColor = useCallback((_: VeCrvHolder, index: number) => barColors[index % barColors.length], [barColors])

  const getValue = (datum: VeCrvHolder) => {
    if (filter === 'weightRatio') return +datum.weightRatio
    if (filter === 'weight') return +datum.weight
    return +datum.locked
  }

  return (
    <EChartsBarChart
      data={data}
      xKey="user"
      yKey={filter}
      yValue={getValue}
      barColor={getBarColor}
      height={height}
      renderTooltip={CustomTooltip}
      xAxisHeight={60}
      xAxisLabelRotate={-45}
      xAxisInterval={0}
      xTickFormatter={value => formatHolderName(String(value))}
      yTickFormatter={value =>
        filter === 'weightRatio' ? formatChartAxisNumber(+value, { unit: 'percentage' }) : formatChartAxisNumber(+value)
      }
    />
  )
}
