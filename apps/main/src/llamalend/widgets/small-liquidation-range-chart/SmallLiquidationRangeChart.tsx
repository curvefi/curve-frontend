import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import {
  SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX,
  SMALL_LIQUIDATION_RANGE_CHART_LOADER,
} from './small-liquidation-range-chart.constants'
import type {
  SmallLiquidationRangeChartData,
  SmallLiquidationRangeChartProps,
} from './small-liquidation-range-chart.types'
import { useSmallLiquidationRangeChartOption } from './useSmallLiquidationRangeChartOption'

export type { SmallLiquidationRangeChartProps } from './small-liquidation-range-chart.types'

const useSmallLiquidationRangeChartData = ({
  prices,
  prevPrices,
  oraclePrice,
}: SmallLiquidationRangeChartProps): SmallLiquidationRangeChartData =>
  useMemo(() => {
    const currentRange = prevPrices?.data
    const newRange = prices?.data ?? undefined
    const chartOraclePrice = oraclePrice.data ?? undefined
    const hasError = !!prices?.error || !!prevPrices?.error || !!oraclePrice.error
    const loading = !hasError && (prices?.isLoading || prevPrices?.isLoading || oraclePrice.isLoading)

    return {
      liquidationRanges: {
        ...(currentRange && { currentRange }),
        ...(newRange && { newRange }),
      },
      oraclePrice: chartOraclePrice,
      loading,
    }
  }, [
    oraclePrice.data,
    oraclePrice.error,
    oraclePrice.isLoading,
    prevPrices?.data,
    prevPrices?.error,
    prevPrices?.isLoading,
    prices?.data,
    prices?.error,
    prices?.isLoading,
  ])

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
