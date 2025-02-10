import { BrowserProvider } from 'ethers'

/* createAppSlice */

/* createAppLayoutSlice */
export type LayoutHeight = {
  globalAlert: number
  mainNav: number
  secondaryNav: number
  footer: number
}

/* createCreateLoanSlice */
export type DetailInfo = {
  healthFull: string
  healthNotFull: string
  prices: string[]
  bands: [number, number]
}

/* createGasSlice */
export type GasInfo = {
  base: number
  priority: number[]
  max: number[]
  basePlusPriority: number[]
}

/* createGlobalSlice */
/* createGasSlice */

/* createLiqRangesSlice */
export type MaxRecvLeverage = {
  maxBorrowable: string
  maxCollateral: string
  leverage: string
  routeIdx: number
}

export type LiqRange = {
  n: number
  collateral: string
  debt: string
  maxRecv: string | null
  maxRecvLeverage: MaxRecvLeverage | null
  maxRecvError: string
  prices: string[]
  bands: [number, number]
}

export type LiqRangeSliderIdx = LiqRange & { sliderIdx: number }
export type LiqRangesMapper = { [n: string]: LiqRangeSliderIdx }

/* createWalletSlice */
export type Provider = BrowserProvider

export type PricesStatisticsDataResponse = PricesStatisticsData

export type PricesStatisticsData = {
  last_updated: string
  last_updated_block: number
  proj_apr: number
  supply: number
}
