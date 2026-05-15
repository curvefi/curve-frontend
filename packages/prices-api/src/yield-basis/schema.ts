import { z } from 'zod/v4'
import { address, camelizeKeys, chain, hex, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const adjacentPool = z.object({
  address,
  name: z.string(),
})

const yieldBasisPool = z.object({
  name: z.string(),
  address,
})

const transaction = z
  .object({
    tx_hash: hex,
    block_number: z.number(),
    timestamp: timestampResponse,
    volume: z.number(),
    adjacent_volume: z.number(),
    adjacent_pools: z.array(adjacentPool),
  })
  .transform(camelizeKeys)
  .transform(data => {
    const { timestamp, ...transaction } = data
    return { ...transaction, timestamp: parseTimestamp(timestamp) }
  })

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
  .transform(camelizeKeys)

const yieldBasisSupplyWithMint = z
  .object({
    yb_factory_balance: z.string(),
    yb_total_allocated: z.string(),
    yb_total_amm_balance: z.string(),
    yb_total_amm_debt: z.string(),
    yb_max_debt: z.string(),
    mint_pegkeeper_debt: z.string(),
    mint_market_debt: z.string(),
    total_supply: z.string(),
  })
  .transform(camelizeKeys)

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
  .transform(camelizeKeys)
  .transform(data => ({
    ybFactoryBalance: parseFloat(data.ybFactoryBalance),
    ybTotalAllocated: parseFloat(data.ybTotalAllocated),
    ybTotalAmmBalance: parseFloat(data.ybTotalAmmBalance),
    ybTotalAmmDebt: parseFloat(data.ybTotalAmmDebt),
    ybMaxDebt: parseFloat(data.ybMaxDebt),
    timestamp: parseTimestamp(data.dt),
    blockNumber: data.blockNumber,
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
  .transform(camelizeKeys)

export const ybAggregatedVolumeResponse = z.object({
  chain,
  stats: aggregatedStats,
})

export const yieldBasisSupplyResponse = z
  .object({
    cached_at: timestampResponse.nullable().optional(),
    data: yieldBasisSupplyWithMint,
  })
  .transform(camelizeKeys)
  .transform(data => ({
    cachedAt: data.cachedAt == null ? undefined : parseTimestamp(data.cachedAt),
    ybFactoryBalance: parseFloat(data.data.ybFactoryBalance),
    ybTotalAllocated: parseFloat(data.data.ybTotalAllocated),
    ybTotalAmmBalance: parseFloat(data.data.ybTotalAmmBalance),
    ybTotalAmmDebt: parseFloat(data.data.ybTotalAmmDebt),
    ybMaxDebt: parseFloat(data.data.ybMaxDebt),
    mintPegkeeperDebt: parseFloat(data.data.mintPegkeeperDebt),
    mintMarketDebt: parseFloat(data.data.mintMarketDebt),
    totalSupply: parseFloat(data.data.totalSupply),
  }))

export const yieldBasisHistoryResponse = z.object({
  chain,
  data: z.array(yieldBasisHistoryItem),
})

export type YieldBasisPool = z.infer<typeof yieldBasisPool>
export type AdjacentPool = z.infer<typeof adjacentPool>
export type YieldBasisTransaction = z.infer<typeof transaction>
export type YieldBasisPoolVolume = z.infer<typeof ybPoolVolumeResponse>
export type YieldBasisAggregatedStats = z.infer<typeof aggregatedStats>
export type YieldBasisAggregatedVolume = z.infer<typeof ybAggregatedVolumeResponse>
export type CrvUsdYieldBasisSupply = z.infer<typeof yieldBasisSupplyResponse>
export type CrvUsdYieldBasisHistoryItem = z.infer<typeof yieldBasisHistoryItem>
export type CrvUsdYieldBasisHistory = z.infer<typeof yieldBasisHistoryResponse>
