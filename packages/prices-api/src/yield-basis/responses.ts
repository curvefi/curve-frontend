import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { TimestampResponse } from '../timestamp'

export type AdjacentPoolResponse = {
  address: Address
  name: string
}

export type YBPool = {
  name: string
  address: Address
}

export type YBTransaction = {
  tx_hash: string
  block_number: number
  timestamp: TimestampResponse
  volume: number
  adjacent_volume: number
  adjacent_pools: AdjacentPoolResponse[]
}

export type YBAggregatedStats = {
  volume_24h: number
  adjacent_volume_24h: number
  yb_total_fees_24h: number
  yb_dao_fees_24h: number
  adjacent_total_fees_24h: number
  adjacent_dao_fees_24h: number
  adjacent_volume_pct_24h: number
  adjacent_dao_fees_pct_24h: number
  volume_7d: number
  adjacent_volume_7d: number
  yb_total_fees_7d: number
  yb_dao_fees_7d: number
  adjacent_total_fees_7d: number
  adjacent_dao_fees_7d: number
  adjacent_volume_pct_7d: number
  adjacent_dao_fees_pct_7d: number
}

export type YBPoolsResponse = {
  count: number
  data: YBPool[]
}

export type YBPoolVolumeResponse = {
  pool_address: Address
  pool_name: string
  transactions: YBTransaction[]
}

export type YBAggregatedVolumeResponse = {
  chain: Chain
  stats: YBAggregatedStats
}

export type YieldBasisSupplyWithMintModel = {
  yb_factory_balance: string
  yb_total_allocated: string
  yb_total_amm_balance: string
  yb_total_amm_debt: string
  yb_max_debt: string
  mint_pegkeeper_debt: string
  mint_market_debt: string
  total_supply: string
}

export type YieldBasisSupplyResponse = {
  cached_at?: TimestampResponse | null
  data: YieldBasisSupplyWithMintModel
}

export type YieldBasisHistoryModel = {
  yb_factory_balance: string
  yb_total_allocated: string
  yb_total_amm_balance: string
  yb_total_amm_debt: string
  yb_max_debt: string
  dt: TimestampResponse
  block_number: number
}

export type YieldBasisHistoryResponse = {
  chain: Chain
  data: YieldBasisHistoryModel[]
}
