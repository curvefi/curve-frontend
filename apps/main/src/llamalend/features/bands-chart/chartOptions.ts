import type { EChartsOption } from 'echarts-for-react'
import { formatNumber } from '@ui/utils'
import { generateMarkLines, createLabelStyle } from './markLines'
import { ChartDataPoint, BandsChartPalette, DerivedChartData, UserBandsPriceRange } from './types'

/**
 * Creates series data with conditional styling for liquidation bands
 */
const createSeriesData = (data: number[], derived: DerivedChartData, color: string, liquidationOutlineColor: string) =>
  data.map((value: number, index: number) => ({
    value,
    itemStyle: {
      color,
      borderColor: derived.isLiquidation[index] ? liquidationOutlineColor : 'transparent',
      borderWidth: derived.isLiquidation[index] ? 2 : 0,
    },
  }))

/**
 * Creates base series configuration with common properties
 */
const createSeriesConfig = (
  name: string,
  data: unknown[],
  markArea?: Record<string, unknown> | null,
  markLine?: Record<string, unknown> | null,
) => {
  const baseConfig = {
    name,
    type: 'bar' as const,
    stack: 'total',
    animation: false,
    data,
    animationDuration: 300,
  }

  return {
    ...baseConfig,
    ...(markArea ? { markArea } : {}),
    ...(markLine ? { markLine } : {}),
  }
}

/**
 * Generates complete ECharts configuration for bands visualization
 */
export const getChartOptions = (
  chartData: ChartDataPoint[],
  derived: DerivedChartData,
  userBandsPriceRange: UserBandsPriceRange,
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
  tooltipFormatter: (params: unknown) => HTMLElement,
): EChartsOption => {
  if (chartData.length === 0) return {}

  const dataZoomWidth = 20
  const gridPadding = { left: 0, top: 40, bottom: 40 }
  const gridRight = 20 + dataZoomWidth

  // Generate mark areas for user band range highlighting
  const markAreas = userBandsPriceRange
    ? [[{ yAxis: userBandsPriceRange.minUserIdx }, { yAxis: userBandsPriceRange.maxUserIdx }]]
    : []

  // Generate all mark lines (user range + oracle price)
  const markLines = generateMarkLines(chartData, userBandsPriceRange, oraclePrice, palette)

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
        lineStyle: {
          color: palette.gridColor,
          opacity: 0.5,
          type: 'dashed',
        },
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
        splitLine: {
          show: true,
          lineStyle: {
            color: palette.gridColor,
            opacity: 0.5,
            type: 'dashed',
          },
        },
        data: derived.yAxisData,
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
          lineStyle: {
            color: palette.gridColor,
            opacity: 0.5,
          },
          areaStyle: {
            color: palette.gridColor,
            opacity: 0.2,
          },
        },
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
