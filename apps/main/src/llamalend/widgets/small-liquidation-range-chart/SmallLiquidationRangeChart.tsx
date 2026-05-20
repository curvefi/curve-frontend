import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { combineQueryState } from '@ui-kit/lib'
import {
  SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX,
  SMALL_LIQUIDATION_RANGE_CHART_LOADER,
} from './small-liquidation-range-chart.constants'
import type {
  SmallLiquidationRangeChartOptionProps,
  SmallLiquidationRangeChartProps,
} from './small-liquidation-range-chart.types'
import { useSmallLiquidationRangeChartOption } from './useSmallLiquidationRangeChartOption'

type SmallLiquidationRangeChartData = SmallLiquidationRangeChartOptionProps & {
  loading: boolean
}

const useSmallLiquidationRangeChartData = ({
  prices,
  prevPrices,
  oraclePrice,
  isFullRepay,
}: SmallLiquidationRangeChartProps): SmallLiquidationRangeChartData => {
  const currentRange = prevPrices?.data
  const newRange = isFullRepay ? undefined : (prices?.data ?? undefined)
  const chartOraclePrice = oraclePrice.data ?? undefined
  const { error, isLoading } = combineQueryState(prices, prevPrices, oraclePrice)

  return useMemo(
    () => ({
      liquidationRanges: {
        ...(currentRange && { currentRange }),
        ...(newRange && { newRange }),
      },
      oraclePrice: chartOraclePrice,
      loading: !error && isLoading,
    }),
    [chartOraclePrice, currentRange, error, isLoading, newRange],
  )
}

export const SmallLiquidationRangeChart = (props: SmallLiquidationRangeChartProps) => {
  const { liquidationRanges, oraclePrice, loading } = useSmallLiquidationRangeChartData(props)
  const option = useSmallLiquidationRangeChartOption({ liquidationRanges, oraclePrice })

  return (
    <Stack flexGrow={1}>
      <Box
        sx={{
          alignSelf: 'stretch',
          height: `${SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX}px`,
          minHeight: `${SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX}px`,
          ...(loading && {
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            paddingBlock: SMALL_LIQUIDATION_RANGE_CHART_LOADER.padding,
          }),
        }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={SMALL_LIQUIDATION_RANGE_CHART_LOADER.height} />
        ) : (
          <ReactECharts
            option={option}
            notMerge
            style={{ width: '100%', height: SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX }}
          />
        )}
      </Box>
    </Stack>
  )
}
