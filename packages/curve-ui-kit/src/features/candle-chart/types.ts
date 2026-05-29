import type { UTCTimestamp } from 'lightweight-charts'
import type { PoolCoin } from '@curvefi/prices-api/pools'
import { TIME_OPTIONS } from './constants'

export type TimeOption = (typeof TIME_OPTIONS)[number]
export type FetchingStatus = 'LOADING' | 'ERROR' | 'READY'

export type ChartSelection =
  | { type: 'lp-usd' }
  | { type: 'lp-token'; symbol: string }
  | { type: 'pair'; mainToken: PoolCoin; refToken: PoolCoin }

export interface LpPriceOhlcData {
  time: number
  open: number
  close: number
  high: number
  low: number
}

export interface LpPriceOhlcDataFormatted {
  time: UTCTimestamp
  open: number
  close: number
  high: number
  low: number
}

export interface LlamaBaselinePriceData {
  time: UTCTimestamp
  base_price: number
}

export interface OraclePriceData {
  time: UTCTimestamp
  value: number
}

export interface LpPriceApiResponse {
  chain: string
  address: string
  data: LpPriceOhlcData[]
}

export interface LiquidationRange { value: number; time: UTCTimestamp }

export interface LlammaLiquididationRange {
  price1: LiquidationRange[]
  price2: LiquidationRange[]
  startTime?: UTCTimestamp
  endTime?: UTCTimestamp
}

export interface LiquidationRanges {
  new: LlammaLiquididationRange | null
  current: LlammaLiquididationRange | null
  historical?: LlammaLiquididationRange[] | null
}
