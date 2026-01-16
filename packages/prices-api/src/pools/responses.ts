import type { Address } from '..'

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
  chain: string
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
    timestamp: number
    volume: number
    fees: number
  }[]
}

export type GetTvlResponse = {
  data: {
    timestamp: number
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

export type GetPoolTradesResponse = {
  chain: string
  address: Address
  main_token: TradeToken
  reference_token: TradeToken
  page: number
  per_page: number
  count: number
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
    time: string
    transaction_hash: Address
    buyer: Address
    usd_fee: number
  }[]
}

export type GetPoolLiquidityEventsResponse = {
  chain: string
  address: Address
  page: number
  per_page: number
  count: number
  data: {
    liquidity_event_type: string
    token_amounts: number[]
    fees: number[]
    token_supply: number
    block_number: number
    time: string
    transaction_hash: Address
    provider: Address
  }[]
}
