/* createAppLayoutSlice */
import { LiqRange } from '@/types/lend.types'

export type LayoutHeight = {
  globalAlert: number
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
  gasPrice: number | null
  max: number[]
  priority: number[]
  basePlusPriority: number[]
  basePlusPriorityL1?: number[] | undefined
  l1GasPriceWei?: number
  l2GasPriceWei?: number
}

export type LiqRange = {
  n: number
  collateral: string
  debt: string
  maxRecv: string | null
  maxRecvError: string
  prices: string[]
  bands: [number, number]
}

export type LiqRangeSliderIdx = LiqRange & { sliderIdx: number }
export type LiqRangesMapper = { [n: string]: LiqRangeSliderIdx }
