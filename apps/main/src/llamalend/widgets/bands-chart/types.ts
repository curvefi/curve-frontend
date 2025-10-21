import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

export type ChartDataPoint = {
  n: number | string
  pUpDownMedian: number
  p_up: number
  p_down: number
  bandCollateralAmount: number
  bandCollateralValueUsd: number
  bandBorrowedAmount: number
  bandBorrowedValueUsd: number
  bandTotalCollateralValueUsd: number
  userBandCollateralAmount: number
  userBandCollateralValueUsd: number
  userBandBorrowedAmount: number
  userBandBorrowedValueUsd: number
  userBandTotalCollateralValueUsd: number
  isLiquidationBand: string
  isOraclePriceBand: boolean
}

export type BandsBalancesData = {
  collateral: string
  collateralUsd?: string // Optional to support both data structures
  collateralStablecoinUsd?: number // Optional
  isLiquidationBand: string
  isOraclePriceBand: boolean
  isNGrouped: boolean
  n: string | number // Unified type
  p_up: string
  p_down: string
  pUpDownMedian: string
  stablecoin?: string // Optional
  borrowed?: string // Optional
  collateralBorrowedUsd?: number // Optional
}

export type BandsChartPalette = {
  backgroundColor: string
  textColor: string
  textColorInverted: string
  gridColor: string
  marketBandColor: string
  userBandColor: string
  borderColor: string
  userRangeHighlightColor: string
  userRangeLabelBackgroundColor: string
  oraclePriceLineColor: string
  liquidationBandOutlineColor: string
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
  userData: number[]
  isLiquidation: boolean[]
}

export type BandsBalances = { [band: number]: { borrowed: string; collateral: string } }
export type BandsBalancesArr = { borrowed: string; collateral: string; band: number }[]

// Parsed bands balance type used in chart data
export type ParsedBandsBalances = {
  borrowed: string
  collateral: string
  collateralUsd: string
  collateralBorrowedUsd: number
  isLiquidationBand: string
  isOraclePriceBand: boolean
  isNGrouped: boolean
  n: number | string
  p_up: any
  p_down: any
  pUpDownMedian: string
}
