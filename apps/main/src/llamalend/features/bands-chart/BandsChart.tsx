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
import type { LlammaLiquididationRange } from '@ui-kit/features/candle-chart/types'
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

interface BandsChartProps {
  collateralToken: BandsChartToken
  borrowToken: BandsChartToken
  chartData: ChartDataPoint[] | undefined
  error: Error | null
  isLoading: boolean
  userBandsBalances: FetchedBandsBalances[]
  newLiquidationRange?: LlammaLiquididationRange | null
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
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

// Candle chart builds LlammaLiquididationRange from [low, high] as:
// price1 = upper line, price2 = lower line. Bands chart consumes the same object for the
// preview range, so preserve that contract instead of sorting the values here.
const toBandsPriceRange = (liquidationRange: LlammaLiquididationRange | null | undefined): BandsPriceRange | null => {
  const upperPrice = liquidationRange?.price1.at(-1)?.value ?? liquidationRange?.price1[0]?.value
  const lowerPrice = liquidationRange?.price2.at(-1)?.value ?? liquidationRange?.price2[0]?.value

  if (lowerPrice === undefined || upperPrice === undefined) return null

  return {
    lowerPrice,
    upperPrice,
  }
}

const BandsChartContent = ({
  collateralToken,
  borrowToken,
  chartData,
  userBandsBalances,
  newLiquidationRange,
  liqRangeCurrentVisible = true,
  liqRangeNewVisible = true,
  oraclePrice,
  priceRange,
}: BandsChartContentProps) => {
  const palette = useBandsChartPalette()
  const derived = useDerivedChartData(chartData)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)
  const rangeOverlays: BandsRangeOverlay[] = useMemo(() => {
    const currentRange = liqRangeCurrentVisible ? toUserBandsPriceRange(userBandsPriceRange) : null
    const newRange = liqRangeNewVisible ? toBandsPriceRange(newLiquidationRange) : null

    return notFalsy<BandsRangeOverlay>(
      currentRange && {
        variant: 'current',
        ...currentRange,
        backgroundColor: palette.userRangeBackgroundColor,
        topLineColor: palette.userRangeTopLineColor,
        bottomLineColor: palette.userRangeBottomLineColor,
      },
      newRange && {
        variant: 'new',
        ...newRange,
        backgroundColor: palette.newRangeBackgroundColor,
        topLineColor: palette.newRangeLineColor,
        bottomLineColor: palette.newRangeLineColor,
      },
    )
  }, [
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    newLiquidationRange,
    palette.newRangeBackgroundColor,
    palette.newRangeLineColor,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
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
 * - New liquidation range preview
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
  newLiquidationRange,
  liqRangeCurrentVisible = true,
  liqRangeNewVisible = true,
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
            newLiquidationRange={newLiquidationRange}
            liqRangeCurrentVisible={liqRangeCurrentVisible}
            liqRangeNewVisible={liqRangeNewVisible}
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
