import type { Address } from '@primitives/address.utils'
import type { PaginationMeta, Chain } from '..'
import type { Timestamp } from '../timestamp'

type Coin = {
  pool_index: number
  symbol: string
  address: Address
}

type Pool = {
  name: string
  address: Address
  n_coins: number
  tvl_usd: number
  trading_volume_24h: number
  trading_fee_24h: number
  liquidity_volume_24h: number
  liquidity_fee_24h: number
  coins?: Coin[]
  base_daily_apr: number
  base_weekly_apr: number
  virtual_price: number
  pool_methods?: string[]
}

export type GetPoolsResponse = {
  chain: Chain
  total: {
    total_tvl: number
    trading_volume_24h: number
    trading_fee_24h: number
    liquidity_volume_24h: number
    liquidity_fee_24h: number
  }
  data: Pool[]
}

export type GetPoolResponse = Pool

export type GetVolumeResponse = {
  data: {
    timestamp: Timestamp
    volume: number
    fees: number
  }[]
}

export type GetTvlResponse = {
  data: {
    timestamp: Timestamp
    tvl_usd?: number
    balances: number[]
    token_prices: number[]
  }[]
}

type TradeToken = {
  symbol: string
  address: Address
  pool_index: number
  event_index: number
}

export type GetPoolTradesResponse = PaginationMeta & {
  chain: Chain
  address: Address
  main_token: TradeToken
  reference_token: TradeToken
  data: {
    sold_id: number
    bought_id: number
    token_sold: Address
    token_bought: Address
    token_sold_symbol: string
    token_bought_symbol: string
    tokens_sold: number
    tokens_sold_usd: number
    tokens_bought: number
    tokens_bought_usd: number
    block_number: number
    time: Timestamp
    transaction_hash: Address
    buyer: Address
    usd_fee: number
  }[]
}

export type GetAllPoolTradesResponse = PaginationMeta & {
  chain: Chain
  address: Address
  data: {
    sold_id: number
    bought_id: number
    tokens_sold: number
    tokens_sold_usd: number
    tokens_bought: number
    tokens_bought_usd: number
    price: number
    block_number: number
    time: Timestamp
    transaction_hash: Address
    buyer: Address
    fee: number
    usd_fee: number
    token_sold: TradeToken
    token_bought: TradeToken
    pool_state: unknown | null
  }[]
}

export type GetPoolLiquidityEventsResponse = PaginationMeta & {
  chain: Chain
  address: Address
  data: {
    liquidity_event_type: string
    token_amounts: number[] | null
    fees: number[] | null
    token_supply: number
    block_number: number
    time: Timestamp
    transaction_hash: Address
    provider: Address
  }[]
}

export type GetPoolSnapshotsResponse = {
  chain: string
  address: string
  data: {
    timestamp: number
    a: number | null
    fee: number | null
    admin_fee: number | null
    virtual_price: number | null
    xcp_profit: number | null
    xcp_profit_a: number | null
    base_daily_apr: number | null
    base_weekly_apr: number | null
    offpeg_fee_multiplier: number | null
    gamma: number | null
    mid_fee: number | null
    out_fee: number | null
    fee_gamma: number | null
    allowed_extra_profit: number | null
    adjustment_step: number | null
    ma_half_time: number | null
    price_scale: number[] | null
    price_oracle: number[] | null
    block_number: number | null
  }[]
}

type MetadataCoin = Coin & {
  decimals: number | null
}

type Oracle = {
  oracle_address: Address | null
  method_id: string | null
  method: string | null
  is_verified: boolean
}

type PoolType =
  | 'main'
  | 'crypto'
  | 'factory'
  | 'factory_crypto'
  | 'crvusd'
  | 'factory_tricrypto'
  | 'stableswapng'
  | 'twocryptong'

export type GetPoolMetadataResponse = {
  name: string
  registry: string
  registry_type: string
  lp_token_address: Address
  coins: MetadataCoin[]
  gauges: string[]
  pool_type: PoolType
  metapool: boolean
  base_pool: string | null
  asset_types: number[] | null
  oracles: (Oracle | null)[] | null
  vyper_version: string | null
  deployment_tx: string | null
  deployment_block: number | null
  deployment_date: Timestamp | null
  has_donations: boolean
}
