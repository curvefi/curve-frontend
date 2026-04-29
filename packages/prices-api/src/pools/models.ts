import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

export type PoolCoin = {
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
  coins: PoolCoin[]
  baseDailyApr: number
  baseWeeklyApr: number
  virtualPrice: number
  poolMethods: string[]
}

export type Volume = {
  timestamp: Timestamp
  volume: number
  fees: number
}

export type Tvl = {
  timestamp: Timestamp
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
  time: Timestamp
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
  time: Timestamp
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
  time: Timestamp
  txHash: Address
  provider: Address
}

export type PoolSnapshot = {
  timestamp: number
  a: number | null
  fee: number | null
  adminFee: number | null
  virtualPrice: number | null
  xcpProfit: number | null
  xcpProfitA: number | null
  baseDailyApr: number | null
  baseWeeklyApr: number | null
  offpegFeeMultiplier: number | null
  gamma: number | null
  midFee: number | null
  outFee: number | null
  feeGamma: number | null
  allowedExtraProfit: number | null
  adjustmentStep: number | null
  maHalfTime: number | null
  priceScale: number[] | null
  priceOracle: number[] | null
  blockNumber: number | null
}

export type MetadataCoin = {
  poolIndex: number
  symbol: string
  address: Address
  decimals: number | null
}

export type Oracle = {
  oracleAddress: Address | null
  methodId: string | null
  method: string | null
  isVerified: boolean
}

export type PoolType =
  | 'main'
  | 'crypto'
  | 'factory'
  | 'factory_crypto'
  | 'crvusd'
  | 'factory_tricrypto'
  | 'stableswapng'
  | 'twocryptong'

export type PoolMetadata = {
  name: string
  registry: string
  registryType: string
  lpTokenAddress: Address
  coins: MetadataCoin[]
  gauges: string[]
  poolType: PoolType
  metapool: boolean
  basePool: string | null
  assetTypes: number[] | null
  oracles: (Oracle | null)[] | null
  vyperVersion: string | null
  deploymentTx: string | null
  deploymentBlock: number | null
  deploymentDate: Timestamp | null
  hasDonations: boolean
}
