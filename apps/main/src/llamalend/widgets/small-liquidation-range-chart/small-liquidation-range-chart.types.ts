import type { Amount, Decimal } from '@primitives/decimal.utils'
import type { QueryProp, Range } from '@ui-kit/types/util'

export type LiquidationRange = readonly [Amount, Amount]
export type RenderableLiquidationRange = readonly [number, number]
export type ChartDomain = readonly [number, number]
export type SplitMode = 'split-left' | 'split-right'

export interface SmallLiquidationRangeChartProps {
  prices: QueryProp<Range<Decimal> | null> | undefined
  prevPrices: QueryProp<Range<Decimal>> | undefined
  oraclePrice: QueryProp<Decimal | null>
  isFullRepay: boolean | undefined
}

export interface SmallLiquidationRangeChartOptionProps {
  liquidationRanges: {
    newRange?: LiquidationRange
    currentRange?: LiquidationRange
  }
  oraclePrice: Amount | undefined
}

export interface OracleRailLayout {
  // Synthetic x-value on the rail axis where the oracle marker is rendered.
  markerPosition: number
  // Rounded price label shown at the far end of the truncated rail.
  terminalTick: number
}

export type SmallLiquidationRangeChartLayout =
  | {
      mode: 'continuous'
      // Real price domain; includes the oracle price in continuous mode.
      mainDomain: ChartDomain
    }
  | {
      mode: SplitMode
      // Real price domain for liquidation ranges only. The distant oracle is moved to the rail.
      mainDomain: ChartDomain
      oracleRail: OracleRailLayout
    }

export type SplitLayout = Extract<SmallLiquidationRangeChartLayout, { mode: 'split-left' | 'split-right' }>
export type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]

export interface ChartTextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
}

export interface ChartColors {
  axisLabel: string
  axisLine: string
  referenceLine: string
  oracleMarkerLabel: string
  oracleMarkerLabelBackground: string
  rangeLabel: string
  currentRange: string
  newRangeLine: string
}

export interface RangeSeriesParams {
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
