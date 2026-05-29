/* createLiqRangesSlice */
export interface MaxRecvLeverage { maxBorrowable: string; maxCollateral: string; leverage: string; routeIdx: number }

export interface LiqRange {
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
