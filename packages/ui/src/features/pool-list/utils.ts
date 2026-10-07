import type { LitePool, V2Pool } from '@curvefi/prices-api/pools'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { decimalGreaterThan, decimalSum, ZERO } from '@ui/lib/decimal'
import type { PoolClaimables, PoolRowData } from './types'

/** Maps Prices API data to row data, normalizing API nulls to the existing undefined-based contract. */
export const poolToRowData = (
  pool: Pick<V2Pool, 'address' | 'name' | 'tradeableCoins' | 'extraRewardsApr'> & Partial<V2Pool>,
): PoolRowData => ({
  address: pool.address,
  baseDailyApr: pool.baseDailyApr ?? undefined,
  baseWeeklyApr: pool.baseWeeklyApr ?? undefined,
  coins: pool.coins ?? pool.tradeableCoins,
  creationDate: pool.creationDate ?? undefined,
  crvApr: pool.crvApr ?? undefined,
  crvAprBoosted: pool.crvAprBoosted ?? undefined,
  extraRewardsApr: pool.extraRewardsApr.map(({ address, apr, name, symbol }) => ({
    address: address ?? undefined,
    apr,
    name: name ?? undefined,
    symbol: symbol ?? undefined,
  })),
  gauge: pool.gauge ?? undefined,
  gauges: pool.gauges ?? [],
  isMetapool: pool.isMetapool ?? false,
  name: pool.name,
  poolType: pool.poolType ?? undefined,
  tradeableCoins: pool.tradeableCoins.map(({ address, symbol }) => ({ address, symbol })),
  tradingVolume24h: pool.tradingVolume24h,
  tvlUsd: pool.tvlUsd ?? undefined,
})

/** Maps API2's Lite pool shape into the source-independent pool-list model. */
export const litePoolToRowData = (pool: LitePool): PoolRowData => {
  const gauges = [...new Set(notFalsy(pool.gaugeAddress, pool.rootGaugeAddress))].map(address => ({
    address,
    isKilled: pool.gaugeIsKilled ?? false,
  }))
  const coins = (pool.coins ?? []).map(coin => ({ address: coin.address, symbol: coin.symbol ?? '' }))

  return {
    address: pool.address,
    baseDailyApr: undefined,
    baseWeeklyApr: undefined,
    coins,
    creationDate: undefined,
    crvApr: pool.gaugeCrvApr?.[0],
    crvAprBoosted: pool.gaugeCrvApr?.[1],
    extraRewardsApr: (pool.gaugeExtraRewards ?? []).flatMap(reward =>
      notFalsy(
        reward.apr != null && {
          address: reward.tokenAddress,
          apr: reward.apr,
          decimals: Number(reward.decimals),
          name: reward.name,
          price: reward.tokenPrice,
          symbol: reward.symbol,
        },
      ),
    ),
    gauge: gauges[0],
    gauges,
    isMetapool: pool.isMetaPool,
    name: pool.name ?? '<No Name>',
    poolType: undefined,
    tradeableCoins: coins,
    tradingVolume24h: undefined,
    tvlUsd: pool.tvl,
  }
}

export const hasClaimableRewards = <T extends PoolClaimables | undefined>(claimables: T) =>
  maybe(claimables, cs => cs.some(({ amount }) => decimalGreaterThan(amount, ZERO)))

export const claimablesTotalUsd = <T extends PoolClaimables | undefined>(claimables: T) =>
  maybe(claimables, cs => decimalSum(...cs.map(r => r.amountUsd)))
