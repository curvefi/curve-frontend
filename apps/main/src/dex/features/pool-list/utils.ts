import { getAddress } from 'viem'
import { Alerts, getVyperExploitedAlert } from '@/dex/hooks/usePoolAlert'
import { TOKEN_ALERTS } from '@/dex/hooks/useTokenAlert'
import { getTokens, isWrappedOnly } from '@/dex/pool.utils'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { DEX_ROUTES } from '@evm-ui/shared/routes'
import { type Nullish, fromEntries, maybe } from '@primitives/objects.utils'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import type { PoolAlerts, PoolRow, PoolRowData } from '@ui/features/pool-list/types'
import { getPoolRates, poolToRowData } from '@ui/features/pool-list/utils'
import { isVyperVulnerablePool } from './alerts'

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

/** Enriches a pool from the API into a fully fledged table row with all necessary data. */
export const enrichPoolRow = (
  pool: PoolRowData,
  { chainId, blockchainId }: NetworkConfig,
  campaignsByAddress: Record<string, CampaignRewards[]> | Nullish,
  userPosition: PoolRow['userPosition'],
): PoolRow => {
  const campaigns = campaignsByAddress?.[pool.address.toLowerCase()]
  return {
    ...pool,
    ...getPoolRates(pool, campaigns),
    chainId,
    blockchainId,
    campaigns,
    hasVyperVulnerability: isVyperVulnerablePool(chainId, pool.address),
    url: getPath({ network: blockchainId }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}`),
    userPosition,
  }
}

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
