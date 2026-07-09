import type { EChartsOption } from 'echarts-for-react'
import type { Decimal } from '@primitives/decimal.utils'

export type { FetchedBandsBalances } from '@/llamalend/queries/bands/types'

export type BandsChartToken = { symbol: string; address: string } | undefined

/**
 * `*Value` fields are denominated in the market borrow token.
 * Collateral values use the band price to convert collateral amount into borrow-token notional.
 * Borrowed amounts are already in the borrow token and are used directly as borrowed values.
 */
export type ChartDataPoint = {
  n: number
  pUpDownMedian: number
  p_up: number
  p_down: number
  bandCollateralAmount?: Decimal
  bandCollateralValue?: Decimal
  bandBorrowedAmount?: Decimal
  bandTotalValue?: Decimal
  userBandCollateralAmount?: Decimal
  userBandCollateralValue?: Decimal
  userBandBorrowedAmount?: Decimal
  userBandTotalValue?: Decimal
  isLiquidationBand: boolean
}

export type BandsChartPalette = {
  gridColor: string
  scaleLabelsColor: string
  marketBandColor: string
  userCollateralShareColor: string
  userBorrowedShareColor: string
  userRangeBackgroundColor: string
  userRangeTopLineColor: string
  userRangeBottomLineColor: string
  newRangeBackgroundColor: string
  newRangeLineColor: string
  oraclePriceLineColor: string
  liquidationBandOutlineColor: string
}

export type BandsPriceRange = {
  lowerPrice: number
  upperPrice: number
}

export type BandsRangeOverlay = {
  variant: 'current' | 'new'
  lowerPrice: number
  upperPrice: number
  backgroundColor: string
  topLineColor: string
  bottomLineColor: string
}

export type UserBandsPriceRange = {
  minUserIdx: number
  maxUserIdx: number
  upperBandPriceUp: number
  lowerBandPriceDown: number
} | null

export type DerivedChartData = {
  yAxisData: number[]
  userCollateralData: number[]
  userBorrowedData: number[]
  bandTotalData: number[]
  isLiquidation: boolean[]
}

type RectSeriesDatum = [
  median: number,
  startX: number,
  widthX: number,
  pDown: number,
  pUp: number,
  isLiquidationNumeric: number,
  endX: number,
]
export type RectSeriesData = RectSeriesDatum[]
type RangeSeriesDatum = [xStart: number, xEnd: number, lowerPrice: number, upperPrice: number]
export type RangeSeriesData = RangeSeriesDatum[]
type HorizontalLineSeriesDatum = [xStart: number, xEnd: number, price: number]
export type HorizontalLineSeriesData = HorizontalLineSeriesDatum[]

export const BANDS_CHART_SERIES_TYPE = {
  rangeArea: 'range-area',
  rangeLine: 'range-line',
  band: 'band',
  oracleLine: 'oracle-line',
} as const

export type BandsChartSeriesType = (typeof BANDS_CHART_SERIES_TYPE)[keyof typeof BANDS_CHART_SERIES_TYPE]

export type BandsChartNativeMarkLineData = [
  { coord: [number, number] },
  { coord: [number, number]; lineStyle?: unknown },
][]

type BandsChartSeriesBase = {
  name: string
  type: 'custom'
}

export type BandsChartSeries =
  | (BandsChartSeriesBase & {
      bandsChartSeriesType: typeof BANDS_CHART_SERIES_TYPE.rangeArea
      data: RangeSeriesData
    })
  | (BandsChartSeriesBase & {
      bandsChartSeriesType: typeof BANDS_CHART_SERIES_TYPE.rangeLine
      data: HorizontalLineSeriesData
    })
  | (BandsChartSeriesBase & {
      bandsChartSeriesType: typeof BANDS_CHART_SERIES_TYPE.band
      data: RectSeriesData
    })
  | (BandsChartSeriesBase & {
      bandsChartSeriesType: typeof BANDS_CHART_SERIES_TYPE.oracleLine
      data: RectSeriesData
      markLine?: { data?: BandsChartNativeMarkLineData }
    })

export type BandsChartOption = Omit<EChartsOption, 'series'> & {
  series?: BandsChartSeries[]
}
