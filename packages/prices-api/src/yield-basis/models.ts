import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { Timestamp } from '../timestamp'

export type YieldBasisPool = {
  name: string
  address: Address
}

export type AdjacentPool = {
  name: string
  address: Address
}

export type YieldBasisTransaction = {
  txHash: string
  blockNumber: number
  timestamp: Timestamp
  volume: number
  adjacentVolume: number
  adjacentPools: AdjacentPool[]
}

export type YieldBasisPoolVolume = {
  poolAddress: Address
  poolName: string
  transactions: YieldBasisTransaction[]
}

export type YieldBasisAggregatedStats = {
  volume24h: number
  adjacentVolume24h: number
  ybTotalFees24h: number
  ybDaoFees24h: number
  adjacentTotalFees24h: number
  adjacentDaoFees24h: number
  adjacentVolumePct24h: number
  adjacentDaoFeesPct24h: number
  volume7d: number
  adjacentVolume7d: number
  ybTotalFees7d: number
  ybDaoFees7d: number
  adjacentTotalFees7d: number
  adjacentDaoFees7d: number
  adjacentVolumePct7d: number
  adjacentDaoFeesPct7d: number
}

export type YieldBasisAggregatedVolume = {
  chain: Chain
  stats: YieldBasisAggregatedStats
}

export type CrvUsdYieldBasisSupply = {
  cachedAt?: Timestamp
  ybFactoryBalance: number
  ybTotalAllocated: number
  ybTotalAmmBalance: number
  ybTotalAmmDebt: number
  ybMaxDebt: number
  mintPegkeeperDebt: number
  mintMarketDebt: number
  totalSupply: number
}

export type CrvUsdYieldBasisHistoryItem = {
  ybFactoryBalance: number
  ybTotalAllocated: number
  ybTotalAmmBalance: number
  ybTotalAmmDebt: number
  ybMaxDebt: number
  timestamp: Timestamp
  blockNumber: number
}

export type CrvUsdYieldBasisHistory = {
  chain: Chain
  data: CrvUsdYieldBasisHistoryItem[]
}
