import { BrowserProvider } from 'ethers'

/* createCreateLoanSlice */
export type DetailInfo = { healthFull: string; healthNotFull: string; prices: string[]; bands: [number, number] }

/* createGasSlice */
export type GasInfo = { base: number; priority: number[]; max: number[]; basePlusPriority: number[] }

/* createLiqRangesSlice */
export type MaxRecvLeverage = { maxBorrowable: string; maxCollateral: string; leverage: string; routeIdx: number }

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
