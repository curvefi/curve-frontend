import type { EChartsOption } from 'echarts-for-react'
import type { Decimal } from '@primitives/decimal.utils'

export type BandsChartToken = { symbol: string; address: string } | undefined

export type ChartDataPoint = {
  n: number
  pUpDownMedian: number
  p_up: number
  p_down: number
  bandCollateralAmount?: number
  bandCollateralValueUsd?: number
  bandBorrowedAmount?: number
  bandBorrowedValueUsd?: number
  bandTotalCollateralValueUsd?: number
  userBandCollateralAmount?: number
  userBandCollateralValueUsd?: number
  userBandBorrowedAmount?: number
  userBandBorrowedValueUsd?: number
  userBandTotalCollateralValueUsd?: number
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
  marketData: number[]
  userCollateralData: number[]
  userBorrowedData: number[]
  isLiquidation: boolean[]
}

export type RectSeriesDatum = [
  median: number,
  startX: number,
  widthX: number,
  pDown: number,
  pUp: number,
  isLiquidationNumeric: number,
  endX: number,
]
export type RectSeriesData = RectSeriesDatum[]
export type RangeSeriesDatum = [xStart: number, xEnd: number, lowerPrice: number, upperPrice: number]
export type RangeSeriesData = RangeSeriesDatum[]
export type HorizontalLineSeriesDatum = [xStart: number, xEnd: number, price: number]
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

export type BandsBalances = { [band: number]: { borrowed: string; collateral: string } }
export type BandsBalancesArr = { borrowed: string; collateral: string; band: number }[]

export type FetchedBandsBalances = {
  borrowed: Decimal
  collateral: Decimal
  collateralUsd: number
  collateralBorrowedUsd: number
  isLiquidationBand: boolean
  n: number
  p_up: number
  p_down: number
  pUpDownMedian: number
}
