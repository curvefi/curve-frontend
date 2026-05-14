import ReactECharts from 'echarts-for-react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX } from './small-liquidation-range-chart.constants'
import type { SmallLiquidationRangeChartProps } from './small-liquidation-range-chart.types'
import { useSmallLiquidationRangeChartOption } from './useSmallLiquidationRangeChartOption'

export type { SmallLiquidationRangeChartProps } from './small-liquidation-range-chart.types'

export const SmallLiquidationRangeChart = ({ liquidationRanges, oraclePrice }: SmallLiquidationRangeChartProps) => {
  const option = useSmallLiquidationRangeChartOption({ liquidationRanges, oraclePrice })

  return (
    <Stack flexGrow={1}>
      <Box
        sx={{
          width: '100%',
          height: `${SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX}px`,
          minHeight: `${SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX}px`,
        }}
      >
        <ReactECharts
          option={option}
          notMerge
          style={{ width: '100%', height: SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX }}
        />
      </Box>
    </Stack>
  )
}
