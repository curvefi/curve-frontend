import type { Address } from '..'

type Coin = {
  poolIndex: number
  symbol: string
  address: Address
}

export type PoolsTotals = {
  tvl: number
  tradingVolume24h: number
  tradingFee24h: number
  liquidityVolume24h: number
  liquidityFee24h: number
}

export type Pool = {
  name: string
  address: Address
  numCoins: number
  tvlUsd: number
  tradingVolume24h: number
  tradingFee24h: number
  liquidityVolume24h: number
  liquidityFee24h: number
  coins: Coin[]
  baseDailyApr: number
  baseWeeklyApr: number
  virtualPrice: number
  poolMethods: string[]
}

export type Volume = {
  timestamp: Date
  volume: number
  fees: number
}

export type Tvl = {
  timestamp: Date
  tvlUSD: number
  balances: number[]
  tokenPrices: number[]
}

export type TradeToken = {
  symbol: string
  address: Address
  poolIndex: number
  eventIndex: number
}

export type PoolTrade = {
  soldId: number
  boughtId: number
  tokenSold: Address
  tokenBought: Address
  tokenSoldSymbol: string
  tokenBoughtSymbol: string
  tokensSold: number
  tokensSoldUsd: number
  tokensBought: number
  tokensBoughtUsd: number
  blockNumber: number
  time: Date
  txHash: Address
  buyer: Address
  usdFee: number
}

export type AllPoolTrade = {
  soldId: number
  boughtId: number
  tokensSold: number
  tokensSoldUsd: number
  tokensBought: number
  tokensBoughtUsd: number
  price: number
  blockNumber: number
  time: Date
  txHash: Address
  buyer: Address
  fee: number
  usdFee: number
  tokenSold: TradeToken
  tokenBought: TradeToken
  poolState: unknown | null
}

export type PoolLiquidityEventType =
  | 'AddLiquidity'
  | 'RemoveLiquidity'
  | 'RemoveLiquidityOne'
  | 'RemoveLiquidityImbalance'

export type PoolLiquidityEvent = {
  eventType: PoolLiquidityEventType
  tokenAmounts: number[]
  fees: number[]
  tokenSupply: number
  blockNumber: number
  time: Date
  txHash: Address
  provider: Address
}
