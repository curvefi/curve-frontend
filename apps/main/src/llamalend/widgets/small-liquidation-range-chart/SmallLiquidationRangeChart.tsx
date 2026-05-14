import ReactECharts from 'echarts-for-react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Amount } from '@primitives/decimal.utils'
import {
  SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX,
  useSmallLiquidationRangeChartOption,
} from './useSmallLiquidationRangeChartOption'

type LiquidationRange = readonly [Amount, Amount]

export interface SmallLiquidationRangeChartProps {
  liquidationRanges: {
    newRange?: LiquidationRange
    currentRange?: LiquidationRange
  }
  oraclePrice: Amount | undefined
}

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
