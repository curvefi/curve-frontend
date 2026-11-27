import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { combineQueryState } from '@ui/features/queries/combine'
import { SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX } from './small-liquidation-range-chart.constants'
import type {
  SmallLiquidationRangeChartOptionProps,
  SmallLiquidationRangeChartProps,
} from './small-liquidation-range-chart.types'
import { useSmallLiquidationRangeChartOption } from './useSmallLiquidationRangeChartOption'

type SmallLiquidationRangeChartData = SmallLiquidationRangeChartOptionProps & { isLoading: boolean }

const useSmallLiquidationRangeChartData = ({
  prices,
  prevPrices,
  oraclePrice,
  isFullRepay,
}: SmallLiquidationRangeChartProps): SmallLiquidationRangeChartData => {
  const currentRange = prevPrices?.data
  const newRange = isFullRepay ? undefined : (prices?.data ?? undefined)
  const chartOraclePrice = oraclePrice.data ?? undefined
  const { isLoading } = combineQueryState(prices, prevPrices, oraclePrice)

  return useMemo(
    () => ({
      liquidationRanges: { ...(currentRange && { currentRange }), ...(newRange && { newRange }) },
      oraclePrice: chartOraclePrice,
      isLoading,
    }),
    [chartOraclePrice, currentRange, isLoading, newRange],
  )
}

export const SmallLiquidationRangeChart = (props: SmallLiquidationRangeChartProps) => {
  const { liquidationRanges, oraclePrice, isLoading } = useSmallLiquidationRangeChartData(props)
  const option = useSmallLiquidationRangeChartOption({ liquidationRanges, oraclePrice })

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <WithSkeleton loading={isLoading} category="content.fullWidth">
        <Box // Box for skeleton dimension inference
          sx={{
            alignSelf: 'stretch',
            height: `${SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX}px`,
            minHeight: `${SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX}px`,
          }}
        >
          {!isLoading && (
            <ReactECharts
              option={option}
              notMerge
              style={{ width: '100%', height: SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX }}
            />
          )}
        </Box>
      </WithSkeleton>
    </Stack>
  )
}
