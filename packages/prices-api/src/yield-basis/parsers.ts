import type { Hex } from '@primitives/address.utils'
import { parseTimestamp } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

const parseNumberString = (value: string) => Number(value)

export const parsePool = (pool: Responses.YBPool): Models.YieldBasisPool => ({
  name: pool.name,
  address: pool.address,
})

export const parseAdjacentPool = (pool: Responses.AdjacentPoolResponse): Models.AdjacentPool => ({
  name: pool.name,
  address: pool.address,
})

export const parseTransaction = (transaction: Responses.YBTransaction): Models.YieldBasisTransaction => ({
  txHash: transaction.tx_hash as Hex,
  blockNumber: transaction.block_number,
  timestamp: parseTimestamp(transaction.timestamp),
  volume: transaction.volume,
  adjacentVolume: transaction.adjacent_volume,
  adjacentPools: transaction.adjacent_pools.map(parseAdjacentPool),
})

export const parsePoolVolume = (response: Responses.YBPoolVolumeResponse): Models.YieldBasisPoolVolume => ({
  poolAddress: response.pool_address,
  poolName: response.pool_name,
  transactions: response.transactions.map(parseTransaction),
})

export const parseAggregatedStats = (stats: Responses.YBAggregatedStats): Models.YieldBasisAggregatedStats => ({
  volume24h: stats.volume_24h,
  adjacentVolume24h: stats.adjacent_volume_24h,
  ybTotalFees24h: stats.yb_total_fees_24h,
  ybDaoFees24h: stats.yb_dao_fees_24h,
  adjacentTotalFees24h: stats.adjacent_total_fees_24h,
  adjacentDaoFees24h: stats.adjacent_dao_fees_24h,
  adjacentVolumePct24h: stats.adjacent_volume_pct_24h,
  adjacentDaoFeesPct24h: stats.adjacent_dao_fees_pct_24h,
  volume7d: stats.volume_7d,
  adjacentVolume7d: stats.adjacent_volume_7d,
  ybTotalFees7d: stats.yb_total_fees_7d,
  ybDaoFees7d: stats.yb_dao_fees_7d,
  adjacentTotalFees7d: stats.adjacent_total_fees_7d,
  adjacentDaoFees7d: stats.adjacent_dao_fees_7d,
  adjacentVolumePct7d: stats.adjacent_volume_pct_7d,
  adjacentDaoFeesPct7d: stats.adjacent_dao_fees_pct_7d,
})

export const parseAggregatedVolume = (
  response: Responses.YBAggregatedVolumeResponse,
): Models.YieldBasisAggregatedVolume => ({
  chain: response.chain,
  stats: parseAggregatedStats(response.stats),
})

export const parseCrvUsdYieldBasisSupply = (
  response: Responses.YieldBasisSupplyResponse,
): Models.CrvUsdYieldBasisSupply => ({
  cachedAt: response.cached_at == null ? undefined : parseTimestamp(response.cached_at),
  ybFactoryBalance: parseNumberString(response.data.yb_factory_balance),
  ybTotalAllocated: parseNumberString(response.data.yb_total_allocated),
  ybTotalAmmBalance: parseNumberString(response.data.yb_total_amm_balance),
  ybTotalAmmDebt: parseNumberString(response.data.yb_total_amm_debt),
  ybMaxDebt: parseNumberString(response.data.yb_max_debt),
  mintPegkeeperDebt: parseNumberString(response.data.mint_pegkeeper_debt),
  mintMarketDebt: parseNumberString(response.data.mint_market_debt),
  totalSupply: parseNumberString(response.data.total_supply),
})

export const parseCrvUsdYieldBasisHistory = (
  response: Responses.YieldBasisHistoryResponse,
): Models.CrvUsdYieldBasisHistory => ({
  chain: response.chain,
  data: response.data.map(item => ({
    ybFactoryBalance: parseNumberString(item.yb_factory_balance),
    ybTotalAllocated: parseNumberString(item.yb_total_allocated),
    ybTotalAmmBalance: parseNumberString(item.yb_total_amm_balance),
    ybTotalAmmDebt: parseNumberString(item.yb_total_amm_debt),
    ybMaxDebt: parseNumberString(item.yb_max_debt),
    timestamp: parseTimestamp(item.dt),
    blockNumber: item.block_number,
  })),
})
