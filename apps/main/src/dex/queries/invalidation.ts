import { getCampaignsExternalQueryKey } from '@evm-ui/entities/campaigns/campaigns-external'
import { getCampaignsPoolsMerklQueryKey } from '@evm-ui/entities/campaigns/campaigns-pools-merkl'
import type { UserChainParams, UserPoolParams } from '@evm-ui/lib/model'
import { queryClient } from '@ui/features/queries/query-client'
import {
  getLitePoolListQueryKey,
  getPoolListRootQueryKey,
  getPoolChainsQueryKey,
  getLitePoolChainsQueryKey,
} from './pool-list.query'
import { invalidateUserPoolBalancesQuery } from './user-pool-balances.query'
import { invalidateUserPoolBoostQuery } from './user-pool-boost.query'
import { invalidateUserPoolLiquidityUsdQuery } from './user-pool-liquidity-usd.query'
import { getUserPoolPositionsQueryKey, invalideUserPoolPositions } from './user-pool-positions.query'
import { invalidateUserPoolRewardCrvApyQuery } from './user-pool-reward-crv-apy.query'
import { invalidateUserPoolShareQuery } from './user-pool-share.query'

/**
 * Compatibility helper that refreshes user-pool-info method queries and the user's pool positions.
 */
export const invalidateUserPoolInfo = async (params: UserPoolParams) => {
  await Promise.all([
    invalidateUserPoolBalancesQuery(params),
    invalidateUserPoolLiquidityUsdQuery(params),
    invalidateUserPoolShareQuery(params),
    invalidateUserPoolRewardCrvApyQuery(params),
    invalidateUserPoolBoostQuery(params),
    invalideUserPoolPositions(params),
  ])
}

export const resetPoolLists = ({ chainId, userAddress }: UserChainParams) =>
  Promise.all(
    [
      getPoolListRootQueryKey({ chainId }),
      getLitePoolListQueryKey({ chainId }),
      getPoolChainsQueryKey({}),
      getLitePoolChainsQueryKey({}),
      getUserPoolPositionsQueryKey({ chainId, userAddress }),
      getCampaignsExternalQueryKey({}),
      getCampaignsPoolsMerklQueryKey({}),
    ].map(queryKey => queryClient.resetQueries({ queryKey })),
  )
