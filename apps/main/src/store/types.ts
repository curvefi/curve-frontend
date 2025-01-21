export interface PricesApiCoin {
  pool_index: number
  symbol: string
  address: string
}

export interface PricesApiPool {
  name: string
  address: string
  n_coins: number
  tvl_usd: number
  trading_fee_24h: number
  liquidity_volume_24h: number
  liquidity_fee_24h: number
  coins: PricesApiCoin[]
}

export interface PricesApiPoolResponse {
  chain: string
  page: number
  per_page: number
  data: PricesApiPool[]
}
