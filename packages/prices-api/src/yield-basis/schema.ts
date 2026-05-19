import { z } from 'zod/v4'
import { address, camelizeKeys, chain, hex, timestamp } from '../schemas'

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
    timestamp,
    volume: z.number(),
    adjacent_volume: z.number(),
    adjacent_pools: z.array(adjacentPool),
  })
  .transform(camelizeKeys)

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
    dt: timestamp,
    block_number: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ ybFactoryBalance, ybTotalAllocated, ybTotalAmmBalance, ybTotalAmmDebt, ybMaxDebt, dt, ...data }) => ({
    ...data,
    ybFactoryBalance: parseFloat(ybFactoryBalance),
    ybTotalAllocated: parseFloat(ybTotalAllocated),
    ybTotalAmmBalance: parseFloat(ybTotalAmmBalance),
    ybTotalAmmDebt: parseFloat(ybTotalAmmDebt),
    ybMaxDebt: parseFloat(ybMaxDebt),
    timestamp: dt,
  }))

export const ybPoolsResponse = z
  .object({
    count: z.number(),
    data: z.array(yieldBasisPool),
  })
  .transform(({ data }) => data)

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
    cached_at: timestamp.nullable().optional(),
    data: yieldBasisSupplyWithMint,
  })
  .transform(camelizeKeys)
  .transform(({ cachedAt, data }) => ({
    cachedAt: cachedAt ?? undefined,
    ybFactoryBalance: parseFloat(data.ybFactoryBalance),
    ybTotalAllocated: parseFloat(data.ybTotalAllocated),
    ybTotalAmmBalance: parseFloat(data.ybTotalAmmBalance),
    ybTotalAmmDebt: parseFloat(data.ybTotalAmmDebt),
    ybMaxDebt: parseFloat(data.ybMaxDebt),
    mintPegkeeperDebt: parseFloat(data.mintPegkeeperDebt),
    mintMarketDebt: parseFloat(data.mintMarketDebt),
    totalSupply: parseFloat(data.totalSupply),
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
