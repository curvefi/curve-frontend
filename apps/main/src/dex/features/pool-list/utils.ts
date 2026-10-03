import { sum } from 'lodash'
import { getAddress } from 'viem'
import { Alerts, getVyperExploitedAlert } from '@/dex/hooks/usePoolAlert'
import { TOKEN_ALERTS } from '@/dex/hooks/useTokenAlert'
import { getTokens, isWrappedOnly } from '@/dex/pool.utils'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { LitePool, V2Pool } from '@curvefi/prices-api/pools'
import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import { DEX_ROUTES } from '@evm-ui/shared/routes'
import { type Nullish, fromEntries, maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { decimal, decimalGreaterThan, decimalSum, ZERO } from '@ui/lib/decimal'
import { isVyperVulnerablePool } from './alerts'
import { getAprCampaigns, getCrvAprRange } from './cells/utils'
import type { PoolAlerts, PoolClaimables, PoolRow, PoolRowData } from './types'

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

/** Maps hydrated Curve pools (PoolTemplate) into the source-independent pool-list model. */
export const curvePoolToRowData = (pool: PoolTemplate): PoolRowData => {
  const { tokens, tokenAddresses } = getTokens(pool, { wrapped: isWrappedOnly(pool) })
  const coins = tokenAddresses.map((address, index) => ({
    poolIndex: index,
    address: getAddress(address),
    symbol: tokens[index],
  }))

  return poolToRowData({
    address: getAddress(pool.address),
    name: pool.name,
    coins,
    tradeableCoins: coins,
    isMetapool: pool.isMeta,
    extraRewardsApr: [],
  })
}

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

/** Enriches a pool from the API into a fully fledged table row with all necessary data. */
export const enrichPoolRow = (
  pool: PoolRowData,
  { chainId, blockchainId }: NetworkConfig,
  campaignsByAddress: Record<string, CampaignRewards[]> | Nullish,
  userPosition: PoolRow['userPosition'],
): PoolRow => {
  const campaigns = campaignsByAddress?.[pool.address.toLowerCase()] ?? []
  const extraRewardsTotalApr = sum(pool.extraRewardsApr.filter(reward => reward.apr > 0).map(reward => reward.apr))
  const campaignRewardsApr = sum(
    getAprCampaigns({ campaigns }).flatMap(({ reward }) => (reward?.type === 'apr' ? [reward.value] : [])),
  )
  const rewardsApr = extraRewardsTotalApr + campaignRewardsApr
  const crv = pool.gauge?.isKilled ? 0 : pool.crvApr
  const netApr = sum([pool.baseDailyApr, crv, rewardsApr])
  const crvRange = pool.gauge?.isKilled ? undefined : getCrvAprRange(pool)
  return {
    ...pool,
    chainId,
    blockchainId,
    campaigns,
    hasVyperVulnerability: isVyperVulnerablePool(chainId, pool.address),
    url: getPath({ network: blockchainId }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}`),
    userPosition,
    extraRewardsTotalApr,
    campaignRewardsApr,
    rewardsApr,
    incentivesApr: sum([crv, rewardsApr]),
    netApr,
    netAprBoosted: maybes([netApr, crvRange], (net, range) => net - range.unboostedRate + range.boostedRate),
  }
}

export const claimablesTotalUsd = (claimables: PoolClaimables | undefined) =>
  maybe(claimables, rewards => decimalSum(...rewards.map(reward => reward.amountUsd)))

export const hasClaimableRewards = (claimables: PoolClaimables) =>
  claimables.some(reward => decimalGreaterThan(decimal(reward.amount) ?? ZERO, ZERO))

/** Get pool alerts for the main app. Resolves EVM address casing. */
export const getPoolListAlerts = (rows: readonly PoolRow[] | undefined, blockchainId: string): PoolAlerts => ({
  pools: maybe(rows, rows =>
    fromEntries(rows.map(pool => [pool.address, Alerts[blockchainId]?.[pool.address.toLowerCase()]])),
  ),
  tokens: maybe(rows, rows =>
    fromEntries(rows.flatMap(pool => pool.coins.map(({ address }) => [address, TOKEN_ALERTS[address.toLowerCase()]]))),
  ),
  vyper: getVyperExploitedAlert(),
})
