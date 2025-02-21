import type { Address, Chain } from '..'

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

export type GetUserPoolsResponse = {
  chain: Chain
  positions: {
    pool_name: string
    pool_address: Address
    lp_token_balance: string
  }[]
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
