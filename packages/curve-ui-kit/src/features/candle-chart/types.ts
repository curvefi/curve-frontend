import type { UTCTimestamp } from 'lightweight-charts'
import type { PoolCoin } from '@curvefi/prices-api/pools'
import { TIME_OPTIONS } from './constants'

export type TimeOption = (typeof TIME_OPTIONS)[number]
export type FetchingStatus = 'LOADING' | 'ERROR' | 'READY'

export type ChartSelection =
  | { type: 'lp-usd' }
  | { type: 'lp-token'; symbol: string }
  | { type: 'pair'; mainToken: PoolCoin; refToken: PoolCoin }

export interface LabelList {
  label: string
}

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

export interface LpTradeToken {
  symbol: string
  address: string
  pool_index: number
  event_index: number
}

export type LiquidationRange = { value: number; time: UTCTimestamp }

export type LlammaLiquididationRange = {
  price1: LiquidationRange[]
  price2: LiquidationRange[]
  startTime?: UTCTimestamp
  endTime?: UTCTimestamp
}

export type LiquidationRanges = {
  new: LlammaLiquididationRange | null
  current: LlammaLiquididationRange | null
  historical?: LlammaLiquididationRange[] | null
}

export interface LpTradesData {
  sold_id: number
  bought_id: number
  token_sold: string
  token_bought: string
  token_sold_symbol: string
  token_bought_symbol: string
  tokens_sold: number
  tokens_sold_usd: number
  tokens_bought: number
  tokens_bought_usd: number
  block_number: number
  time: string
  transaction_hash: string
  buyer: string
  usd_fee: number
}

export interface LpTradesApiResponse {
  chain: string
  address: string
  main_token: LpTradeToken
  reference_token: LpTradeToken
  data: LpTradesData[]
}

export interface LpLiquidityEventsData {
  liquidity_event_type: string
  token_amounts: number[]
  fees: number[]
  token_supply: number
  block_number: number
  time: string
  transaction_hash: string
  provider: string
}

export interface LpLiquidityEventsApiResponse {
  chain: string
  address: string
  data: LpLiquidityEventsData[]
}
