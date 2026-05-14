import type { SmallLiquidationRangeChartLayout } from './small-liquidation-range-chart.utils'
import type { SmallLiquidationRangeChartProps } from './SmallLiquidationRangeChart'

export type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]
export type LiquidationRange = SmallLiquidationRangeChartProps['liquidationRanges']['currentRange']
export type RenderableLiquidationRange = readonly [number, number]

export type ChartTextStyle = {
  fontFamily: string
  fontSize: number
  fontWeight: string | number
  lineHeight: number
}

export type ChartColors = {
  axisLabel: string
  axisLine: string
  referenceLine: string
  oracleMarkerLabel: string
  oracleMarkerLabelBackground: string
  rangeLabel: string
  currentRange: string
  newRangeLine: string
}

export type SplitLayout = Extract<SmallLiquidationRangeChartLayout, { mode: 'split-left' | 'split-right' }>

export type RangeSeriesParams = {
  rangeMarkAreas: RangeMarkArea[]
  seriesData: number[][]
}

export type BuildOptionContext = RangeSeriesParams & {
  chartTextStyle: ChartTextStyle
  colors: ChartColors
  formattedOraclePrice: string
  hasChartData: boolean
  htmlFontSize: number
  oraclePrice?: number
}
