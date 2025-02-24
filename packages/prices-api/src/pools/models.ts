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

export type UserPool = {
  poolName: string
  poolAddress: Address
  lpTokenBalance: number
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
