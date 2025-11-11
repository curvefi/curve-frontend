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
  isLiquidationBand: string
  isOraclePriceBand: boolean
}

export type BandsChartPalette = {
  backgroundColor: string
  textColor: string
  textColorInverted: string
  gridColor: string
  scaleLabelsColor: string
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

export type FetchedBandsBalances = {
  borrowed: string
  collateral: string
  collateralUsd: number
  collateralBorrowedUsd: number
  isLiquidationBand: string
  n: number
  p_up: number
  p_down: number
  pUpDownMedian: number
}

export type ParsedBandsBalances = FetchedBandsBalances & {
  borrowedValueUsd: number
  collateralValueUsd: number
  totalBandValueUsd: number
}
