import { z } from 'zod/v4'
import { address, chain, hex, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const adjacentPool = z
  .object({
    address,
    name: z.string(),
  })
  .transform(data => ({
    name: data.name,
    address: data.address,
  }))

const yieldBasisPool = z
  .object({
    name: z.string(),
    address,
  })
  .transform(data => ({
    name: data.name,
    address: data.address,
  }))

const transaction = z
  .object({
    tx_hash: hex,
    block_number: z.number(),
    timestamp: timestampResponse,
    volume: z.number(),
    adjacent_volume: z.number(),
    adjacent_pools: z.array(adjacentPool),
  })
  .transform(data => ({
    txHash: data.tx_hash,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
    volume: data.volume,
    adjacentVolume: data.adjacent_volume,
    adjacentPools: data.adjacent_pools,
  }))

const aggregatedStats = z
  .object({
    volume_24h: z.number(),
    adjacent_volume_24h: z.number(),
    yb_total_fees_24h: z.number(),
    yb_dao_fees_24h: z.number(),
    adjacent_total_fees_24h: z.number(),
    adjacent_dao_fees_24h: z.number(),
    adjacent_volume_pct_24h: z.number(),
    adjacent_dao_fees_pct_24h: z.number(),
    volume_7d: z.number(),
    adjacent_volume_7d: z.number(),
    yb_total_fees_7d: z.number(),
    yb_dao_fees_7d: z.number(),
    adjacent_total_fees_7d: z.number(),
    adjacent_dao_fees_7d: z.number(),
    adjacent_volume_pct_7d: z.number(),
    adjacent_dao_fees_pct_7d: z.number(),
  })
  .transform(data => ({
    volume24h: data.volume_24h,
    adjacentVolume24h: data.adjacent_volume_24h,
    ybTotalFees24h: data.yb_total_fees_24h,
    ybDaoFees24h: data.yb_dao_fees_24h,
    adjacentTotalFees24h: data.adjacent_total_fees_24h,
    adjacentDaoFees24h: data.adjacent_dao_fees_24h,
    adjacentVolumePct24h: data.adjacent_volume_pct_24h,
    adjacentDaoFeesPct24h: data.adjacent_dao_fees_pct_24h,
    volume7d: data.volume_7d,
    adjacentVolume7d: data.adjacent_volume_7d,
    ybTotalFees7d: data.yb_total_fees_7d,
    ybDaoFees7d: data.yb_dao_fees_7d,
    adjacentTotalFees7d: data.adjacent_total_fees_7d,
    adjacentDaoFees7d: data.adjacent_dao_fees_7d,
    adjacentVolumePct7d: data.adjacent_volume_pct_7d,
    adjacentDaoFeesPct7d: data.adjacent_dao_fees_pct_7d,
  }))

const yieldBasisSupplyWithMint = z.object({
  yb_factory_balance: z.string(),
  yb_total_allocated: z.string(),
  yb_total_amm_balance: z.string(),
  yb_total_amm_debt: z.string(),
  yb_max_debt: z.string(),
  mint_pegkeeper_debt: z.string(),
  mint_market_debt: z.string(),
  total_supply: z.string(),
})

const yieldBasisHistoryItem = z
  .object({
    yb_factory_balance: z.string(),
    yb_total_allocated: z.string(),
    yb_total_amm_balance: z.string(),
    yb_total_amm_debt: z.string(),
    yb_max_debt: z.string(),
    dt: timestampResponse,
    block_number: z.number(),
  })
  .transform(data => ({
    ybFactoryBalance: parseFloat(data.yb_factory_balance),
    ybTotalAllocated: parseFloat(data.yb_total_allocated),
    ybTotalAmmBalance: parseFloat(data.yb_total_amm_balance),
    ybTotalAmmDebt: parseFloat(data.yb_total_amm_debt),
    ybMaxDebt: parseFloat(data.yb_max_debt),
    timestamp: parseTimestamp(data.dt),
    blockNumber: data.block_number,
  }))

export const ybPoolsResponse = z
  .object({
    count: z.number(),
    data: z.array(yieldBasisPool),
  })
  .transform(data => data.data)

export const ybPoolVolumeResponse = z
  .object({
    pool_address: address,
    pool_name: z.string(),
    transactions: z.array(transaction),
  })
  .transform(data => ({
    poolAddress: data.pool_address,
    poolName: data.pool_name,
    transactions: data.transactions,
  }))

export const ybAggregatedVolumeResponse = z
  .object({
    chain,
    stats: aggregatedStats,
  })
  .transform(data => ({
    chain: data.chain,
    stats: data.stats,
  }))

export const yieldBasisSupplyResponse = z
  .object({
    cached_at: timestampResponse.nullable().optional(),
    data: yieldBasisSupplyWithMint,
  })
  .transform(data => ({
    cachedAt: data.cached_at == null ? undefined : parseTimestamp(data.cached_at),
    ybFactoryBalance: parseFloat(data.data.yb_factory_balance),
    ybTotalAllocated: parseFloat(data.data.yb_total_allocated),
    ybTotalAmmBalance: parseFloat(data.data.yb_total_amm_balance),
    ybTotalAmmDebt: parseFloat(data.data.yb_total_amm_debt),
    ybMaxDebt: parseFloat(data.data.yb_max_debt),
    mintPegkeeperDebt: parseFloat(data.data.mint_pegkeeper_debt),
    mintMarketDebt: parseFloat(data.data.mint_market_debt),
    totalSupply: parseFloat(data.data.total_supply),
  }))

export const yieldBasisHistoryResponse = z
  .object({
    chain,
    data: z.array(yieldBasisHistoryItem),
  })
  .transform(data => ({
    chain: data.chain,
    data: data.data,
  }))

export type YieldBasisPool = z.infer<typeof yieldBasisPool>
export type AdjacentPool = z.infer<typeof adjacentPool>
export type YieldBasisTransaction = z.infer<typeof transaction>
export type YieldBasisPoolVolume = z.infer<typeof ybPoolVolumeResponse>
export type YieldBasisAggregatedStats = z.infer<typeof aggregatedStats>
export type YieldBasisAggregatedVolume = z.infer<typeof ybAggregatedVolumeResponse>
export type CrvUsdYieldBasisSupply = z.infer<typeof yieldBasisSupplyResponse>
export type CrvUsdYieldBasisHistoryItem = z.infer<typeof yieldBasisHistoryItem>
export type CrvUsdYieldBasisHistory = z.infer<typeof yieldBasisHistoryResponse>
