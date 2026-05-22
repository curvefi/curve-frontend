import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, memo } from 'react'
import type {
  BandsChartOption,
  BandsChartToken,
  BandsPriceRange,
  BandsRangeOverlay,
  ChartDataPoint,
  FetchedBandsBalances,
  UserBandsPriceRange,
} from '@/llamalend/features/bands-chart/types'
import { Box, useTheme } from '@mui/material'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart/ChartStateWrapper'
import { useEChartsTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsTooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getChartOptions } from './chartOptions'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import { useBandsChartZoom } from './hooks/useBandsChartZoom'
import { useDerivedChartData } from './hooks/useDerivedChartData'
import { useUserBandsPriceRange } from './hooks/useUserBandsPriceRange'
import { TooltipContent } from './TooltipContent'

const { Height } = SizesAndSpaces

type BandsChartProps = {
  collateralToken: BandsChartToken
  borrowToken: BandsChartToken
  chartData: ChartDataPoint[] | undefined
  error: Error | null
  isLoading: boolean
  userBandsBalances: FetchedBandsBalances[]
  oraclePrice?: string
  height?: number
  priceRange?: { min: number; max: number }
}

type BandsChartContentProps = Omit<BandsChartProps, 'chartData' | 'error' | 'isLoading' | 'height'> & {
  chartData: ChartDataPoint[]
}

// These fields are named from the LLAMMA band orientation, not from screen position:
// lowerBandPriceDown is the visual upper/current-top boundary, and upperBandPriceUp
// is the visual lower/current-bottom boundary. Keep that mapping so the current
// range line colors match candle-chart's red top line and yellow bottom line.
const toUserBandsPriceRange = (userBandsPriceRange: UserBandsPriceRange): BandsPriceRange | null => {
  if (!userBandsPriceRange) return null

  return {
    lowerPrice: userBandsPriceRange.upperBandPriceUp,
    upperPrice: userBandsPriceRange.lowerBandPriceDown,
  }
}

const BandsChartContent = ({
  collateralToken,
  borrowToken,
  chartData,
  userBandsBalances,
  oraclePrice,
  priceRange,
}: BandsChartContentProps) => {
  const palette = useBandsChartPalette()
  const derived = useDerivedChartData(chartData)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)
  const rangeOverlays: BandsRangeOverlay[] = useMemo(() => {
    const currentRange = toUserBandsPriceRange(userBandsPriceRange)

    return notFalsy<BandsRangeOverlay>(
      currentRange && {
        variant: 'current',
        ...currentRange,
        backgroundColor: palette.userRangeBackgroundColor,
        topLineColor: palette.userRangeTopLineColor,
        bottomLineColor: palette.userRangeBottomLineColor,
      },
    )
  }, [
    palette.userRangeBackgroundColor,
    palette.userRangeBottomLineColor,
    palette.userRangeTopLineColor,
    userBandsPriceRange,
  ])
  const theme = useTheme()
  const tooltipFormatter = useEChartsTooltip(chartData, theme, data => (
    <TooltipContent data={data} collateralToken={collateralToken} borrowToken={borrowToken} />
  ))
  const option: BandsChartOption = useMemo(
    () => getChartOptions(chartData, derived, rangeOverlays, oraclePrice, palette, tooltipFormatter),
    [chartData, derived, rangeOverlays, oraclePrice, palette, tooltipFormatter],
  )
  const finalOption = useBandsChartZoom({ option, priceRange, chartData, derived })

  return (
    <ReactECharts
      option={finalOption as EChartsOption}
      style={{ width: '100%', height: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
      autoResize={true}
    />
  )
}

/**
 * BandsChart - Visualizes bands for lending markets
 *
 * Shows stacked bar chart with:
 * - Market collateral distribution across price bands
 * - User position liquidation range
 * - User price line markers for start and end of liquidation range
 * - Oracle price line marker
 */
const BandsChartComponent = ({
  collateralToken,
  borrowToken,
  chartData,
  error,
  isLoading,
  userBandsBalances,
  oraclePrice,
  height = Height.chart,
  priceRange,
}: BandsChartProps) => {
  const isChartDataPending = !error && chartData === undefined

  return (
    <Box
      sx={{
        display: 'flex',
        fontVariantNumeric: 'tabular-nums',
        width: '100%',
        minHeight: `${height}px`,
        height,
        minWidth: 0,
      }}
    >
      <ChartStateWrapper
        height={height}
        isLoading={isLoading || isChartDataPending}
        isEmpty={chartData?.length === 0}
        emptyMessage={t`No active bands for this market`}
        error={error}
        errorMessage={t`Failed to load bands chart data`}
      >
        {chartData != null && (
          <BandsChartContent
            collateralToken={collateralToken}
            borrowToken={borrowToken}
            chartData={chartData}
            userBandsBalances={userBandsBalances}
            oraclePrice={oraclePrice}
            priceRange={priceRange}
          />
        )}
      </ChartStateWrapper>
    </Box>
  )
}

/**
 * Memoized export to prevent unnecessary re-renders when parent components update
 */
export const BandsChart = memo(BandsChartComponent)
