import type { EChartsOption } from 'echarts-for-react'
import { Token } from '@/llamalend/features/borrow/types'
import { formatNumber } from '@ui/utils'
import { ChartDataPoint, BandsChartPalette, DerivedChartData, UserBandsPriceRange } from './types'

export const getChartOptions = (
  chartData: ChartDataPoint[],
  derived: DerivedChartData,
  hasBrush: boolean,
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

  const markAreas: Array<{ yAxis: number }[]> = []
  if (userBandsPriceRange) {
    markAreas.push([{ yAxis: userBandsPriceRange.minUserIdx }, { yAxis: userBandsPriceRange.maxUserIdx }])
  }

  const markLines: Array<{
    yAxis: number
    label: { formatter: string; position?: string }
    lineStyle: { color: string; type: string; width: number }
  }> = []

  if (userBandsPriceRange) {
    markLines.push({
      yAxis: userBandsPriceRange.maxUserIdx,
      label: {
        formatter: `$${formatNumber(userBandsPriceRange.lowerBandPriceDown, { notation: 'compact' })}`,
        position: 'insideEndBottom',
      },
      lineStyle: {
        color: palette.userRangeLabelBackgroundColor,
        type: 'dashed',
        width: 2,
      },
    })

    markLines.push({
      yAxis: userBandsPriceRange.minUserIdx,
      label: {
        formatter: `$${formatNumber(userBandsPriceRange.upperBandPriceUp, { notation: 'compact' })}`,
        position: 'insideEndTop',
      },
      lineStyle: {
        color: palette.userRangeLabelBackgroundColor,
        type: 'dashed',
        width: 2,
      },
    })
  }

  if (oraclePrice) {
    let oracleIdx = findBandIndexByPrice(chartData, Number(oraclePrice))
    if (oracleIdx === -1) oracleIdx = findClosestBandIndex(chartData, Number(oraclePrice))

    if (oracleIdx !== -1) {
      markLines.push({
        yAxis: oracleIdx,
        label: {
          formatter: `$${formatNumber(oraclePrice, { notation: 'compact' })}`,
          position: 'insideEndTop',
        },
        lineStyle: {
          color: palette.oraclePriceLineColor,
          type: 'dashed',
          width: 2,
        },
      })
    }
  }

  const dataZoomWidth = 20

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: {
      left: 0,
      right: 20 + dataZoomWidth,
      top: 40,
      bottom: 40,
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
      {
        name: 'Market Collateral',
        type: 'bar',
        stack: 'total',
        animation: false,
        progressive: 500,
        progressiveThreshold: 3000,
        progressiveChunkMode: 'mod',
        data: derived.marketData.map((value: number, index: number) => ({
          value,
          itemStyle: {
            color: palette.marketBandColor,
            borderColor: derived.isLiquidation[index] ? palette.liquidationBandOutlineColor : 'transparent',
            borderWidth: derived.isLiquidation[index] ? 2 : 0,
          },
        })),
        animationDuration: 300,
        animationEasing: 'cubicOut',
        barCategoryGap: '20%',
        markArea:
          markAreas.length > 0
            ? { silent: true, itemStyle: { color: palette.userRangeHighlightColor }, data: markAreas }
            : undefined,
        markLine:
          markLines.length > 0
            ? {
                silent: false,
                symbol: 'none',
                lineStyle: { width: 2 },
                label: { position: 'insideEndTop', padding: [2, 4], fontSize: 12 },
                data: markLines.map((line) => ({
                  ...line,
                  label: {
                    ...line.label,
                    backgroundColor:
                      line.lineStyle.color === palette.oraclePriceLineColor
                        ? palette.oraclePriceLineColor
                        : palette.userRangeLabelBackgroundColor,
                    color:
                      line.lineStyle.color === palette.oraclePriceLineColor
                        ? palette.textColorInverted
                        : palette.textColor,
                  },
                })),
              }
            : undefined,
      },
      {
        name: 'User Collateral',
        type: 'bar',
        stack: 'total',
        animation: false,
        progressive: 500,
        progressiveThreshold: 3000,
        progressiveChunkMode: 'mod',
        data: derived.userData.map((value: number, index: number) => ({
          value,
          itemStyle: {
            color: palette.userBandColor,
            borderColor: derived.isLiquidation[index] ? palette.liquidationBandOutlineColor : 'transparent',
            borderWidth: derived.isLiquidation[index] ? 2 : 0,
          },
        })),
        animationDuration: 300,
        animationEasing: 'cubicOut',
        barCategoryGap: '20%',
      },
    ],
    dataZoom: hasBrush
      ? [
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
          { type: 'inside', yAxisIndex: 0, orient: 'vertical', zoomOnMouseWheel: 'shift', moveOnMouseWheel: true },
        ]
      : [],
  }
}
