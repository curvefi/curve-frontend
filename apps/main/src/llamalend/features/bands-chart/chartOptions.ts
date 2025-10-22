import type { EChartsOption } from 'echarts-for-react'
import { Token } from '@/llamalend/features/borrow/types'
import { formatNumber } from '@ui/utils'
import { ChartDataPoint, BandsChartPalette, DerivedChartData, UserBandsPriceRange } from './types'

// Helper function to create label styling
const createLabelStyle = (lineStyle: { color: string }, palette: BandsChartPalette) => ({
  padding: [2, 4],
  fontSize: 12,
  backgroundColor:
    lineStyle.color === palette.oraclePriceLineColor
      ? palette.oraclePriceLineColor
      : palette.userRangeLabelBackgroundColor,
  color: lineStyle.color === palette.oraclePriceLineColor ? palette.textColorInverted : palette.textColor,
})

// Helper function to create mark line
const createMarkLine = (
  yAxis: number,
  formatter: string,
  position: string,
  color: string,
  type: string = 'dashed',
  width: number = 2,
) => ({
  yAxis,
  label: { formatter, position },
  lineStyle: { color, type, width },
})

// Helper function to create series data
const createSeriesData = (data: number[], derived: DerivedChartData, color: string, liquidationOutlineColor: string) =>
  data.map((value: number, index: number) => ({
    value,
    itemStyle: {
      color,
      borderColor: derived.isLiquidation[index] ? liquidationOutlineColor : 'transparent',
      borderWidth: derived.isLiquidation[index] ? 2 : 0,
    },
  }))

// Common series configuration
const createSeriesConfig = (name: string, data: any[], markArea?: any, markLine?: any) => ({
  name,
  type: 'bar',
  stack: 'total',
  animation: false,
  progressive: 500,
  progressiveThreshold: 3000,
  progressiveChunkMode: 'mod',
  data,
  animationDuration: 300,
  animationEasing: 'cubicOut',
  barCategoryGap: '20%',
  ...(markArea && { markArea }),
  ...(markLine && { markLine }),
})

export const getChartOptions = (
  chartData: ChartDataPoint[],
  derived: DerivedChartData,
  userBandsPriceRange: UserBandsPriceRange,
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
  collateralToken: Token | undefined,
  borrowToken: Token | undefined,
  findBandIndexByPrice: (chartData: ChartDataPoint[], price: number) => number,
  findClosestBandIndex: (chartData: ChartDataPoint[], price: number) => number,
  tooltipFormatter: (params: any) => HTMLElement,
): EChartsOption => {
  if (chartData.length === 0) return {}

  const dataZoomWidth = 20
  const gridPadding = { left: 0, top: 40, bottom: 40 }
  const gridRight = 20 + dataZoomWidth

  const markAreas = userBandsPriceRange
    ? [[{ yAxis: userBandsPriceRange.minUserIdx }, { yAxis: userBandsPriceRange.maxUserIdx }]]
    : []

  const markLines = [
    // User range lines
    ...(userBandsPriceRange
      ? [
          createMarkLine(
            userBandsPriceRange.maxUserIdx,
            `$${formatNumber(userBandsPriceRange.lowerBandPriceDown, { notation: 'compact' })}`,
            'insideEndTop',
            palette.userRangeLabelBackgroundColor,
          ),
          createMarkLine(
            userBandsPriceRange.minUserIdx,
            `$${formatNumber(userBandsPriceRange.upperBandPriceUp, { notation: 'compact' })}`,
            'insideEndBottom',
            palette.userRangeLabelBackgroundColor,
          ),
        ]
      : []),
    // Oracle price line
    ...(oraclePrice
      ? (() => {
          let oracleIdx = findBandIndexByPrice(chartData, Number(oraclePrice))
          if (oracleIdx === -1) oracleIdx = findClosestBandIndex(chartData, Number(oraclePrice))
          return oracleIdx !== -1
            ? [
                createMarkLine(
                  oracleIdx,
                  `$${formatNumber(oraclePrice, { notation: 'compact' })}`,
                  'insideEndTop',
                  palette.oraclePriceLineColor,
                ),
              ]
            : []
        })()
      : []),
  ].flat()

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: {
      left: gridPadding.left,
      right: gridRight,
      top: gridPadding.top,
      bottom: gridPadding.bottom,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: tooltipFormatter,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
    },
    xAxis: {
      type: 'value',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: palette.gridColor,
        fontSize: 12,
        hideOverlap: true,
        interval: 'auto',
        margin: 8,
        formatter: (value: number) => `$${formatNumber(value, { notation: 'compact' })}`,
      },
      splitLine: {
        show: true,
        lineStyle: { color: palette.gridColor, opacity: 0.5, type: 'dashed' },
      },
    },
    yAxis: [
      {
        type: 'category',
        position: 'right',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: palette.gridColor,
          fontSize: 12,
          formatter: (value: number | string) => `$${formatNumber(Number(value), { notation: 'compact' })}`,
        },
        splitLine: { show: true, lineStyle: { color: palette.gridColor, opacity: 0.5, type: 'dashed' } },
        data: derived.yAxisData,
        boundaryGap: true,
      },
    ],
    series: [
      createSeriesConfig(
        'Market Collateral',
        createSeriesData(derived.marketData, derived, palette.marketBandColor, palette.liquidationBandOutlineColor),
        markAreas.length > 0
          ? { silent: true, itemStyle: { color: palette.userRangeHighlightColor }, data: markAreas }
          : undefined,
        markLines.length > 0
          ? {
              silent: false,
              symbol: 'none',
              lineStyle: { width: 2 },
              data: markLines.map((line) => ({
                ...line,
                label: { ...line.label, ...createLabelStyle(line.lineStyle, palette) },
              })),
            }
          : undefined,
      ),
      createSeriesConfig(
        'User Collateral',
        createSeriesData(derived.userData, derived, palette.userBandColor, palette.liquidationBandOutlineColor),
      ),
    ],
    dataZoom: [
      {
        type: 'slider',
        yAxisIndex: 0,
        orient: 'vertical',
        right: 10,
        width: dataZoomWidth,
        brushSelect: false,
        showDataShadow: false,
        borderColor: palette.gridColor,
        fillerColor: 'rgba(128, 128, 128, 0.2)',
        handleSize: '80%',
        handleStyle: { color: palette.gridColor, borderColor: palette.gridColor },
        textStyle: { color: palette.gridColor, fontSize: 10 },
        labelFormatter: (value: number | string) => `$${formatNumber(Number(value), { notation: 'compact' })}`,
        dataBackground: {
          lineStyle: { color: palette.gridColor, opacity: 0.5 },
          areaStyle: { color: palette.gridColor, opacity: 0.2 },
        },
        zoomLock: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        preventDefaultMouseMove: true,
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        orient: 'vertical',
        zoomOnMouseWheel: 'shift',
        moveOnMouseWheel: true,
      },
    ],
  }
}
