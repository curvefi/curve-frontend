import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { LitePool, V2Pool } from '@curvefi/prices-api/pools'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { DEX_ROUTES } from '@evm-ui/shared/routes'
import { notFalsy } from '@primitives/objects.utils'
import { isVyperVulnerablePool } from './alerts'
import type { PoolRow, PoolRowData } from './types'

/** Maps Prices API pool data into the source-independent pool-list model. */
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
    name: pool.name ?? '',
    poolType: undefined,
    tradeableCoins: coins,
    tradingVolume24h: undefined,
    tvlUsd: pool.tvl,
  }
}

/** Enriches a pool from the API into a fully fledged table row with all necessary data. */
export const enrichPoolRow = (
  pool: PoolRowData,
  { chainId, blockchainId }: NetworkConfig,
  campaignsByAddress: Record<string, CampaignRewards[]> | null | undefined,
  userPosition: PoolRow['userPosition'] = { lpBalance: '0' },
): PoolRow => ({
  ...pool,
  chainId,
  blockchainId,
  campaigns: campaignsByAddress?.[pool.address.toLowerCase()] ?? [],
  hasVyperVulnerability: isVyperVulnerablePool(chainId, pool.address),
  url: getPath({ network: blockchainId }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}`),
  userPosition,
})
