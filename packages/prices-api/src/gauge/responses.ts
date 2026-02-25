import type { Address } from '@primitives/address.utils'

type Gauge = {
  address: Address
  gauge_type: string
  name: string | null
  version: string | null
  lp_token: Address | null
  pool: {
    address: Address
    name: string
    chain: string
    tvl_usd: number
    trading_volume_24h: number
  } | null
  tokens:
    | {
        symbol: string
        address: Address
        precision: number
      }[]
    | null
  market: {
    name: string
    chain: string
  } | null
  is_killed: boolean
  emissions: number
  gauge_weight: string
  gauge_weight_7d_delta: number | null
  gauge_weight_60d_delta: number | null
  gauge_relative_weight: number
  gauge_relative_weight_7d_delta: number | null
  gauge_relative_weight_60d_delta: number | null
  creation_tx: Address
  creation_date: string
  last_vote_date: string | null
  last_vote_tx: Address | null
}

export type GetGaugeResponse = Gauge

export type GetGaugesResponse = {
  gauges: Gauge[]
}

export type GetVotesResponse = {
  votes: {
    user: Address
    weight: number
    block_number: number
    timestamp: string
    transaction: Address
  }[]
}

export type GetWeightHistoryResponse = {
  data: {
    is_killed: boolean
    gauge_weight: string
    gauge_relative_weight: string
    emissions: string
    epoch: number
  }[]
}

export type GetDeploymentResponse = {
  from_address: Address
  to_address: Address | null
  calldata: string
  decoded_calldata: string | null
  transaction_hash: Address
  block_number: number
  dt: string
}

export type GetUserGaugeVotesResponse = {
  votes: {
    gauge: Address
    gauge_name: string
    weight: number
    block_number: number
    timestamp: string
    transaction: Address
  }[]
}
