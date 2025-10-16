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
