import type { PoolParams, UserChainParams, UserPoolParams } from '@evm-ui/lib/model'
import { getCampaignsExternalQueryKey } from '@evm-ui/queries/campaigns/campaigns-external.query'
import { getCampaignsPoolsMerklQueryKey } from '@evm-ui/queries/campaigns/campaigns-pools-merkl.query'
import { getLitePoolListQueryKey } from '@ui/features/pool-list/lite-pool-list.query'
import { queryClient } from '@ui/features/queries/query-client'
import { invalidatePoolCurrencyReserves } from './pool-currency-reserves.query'
import { invalidatePoolGaugeStatus } from './pool-gauge-status.query'
import { getPoolListRootQueryKey, getPoolChainsQueryKey, getLitePoolChainsQueryKey } from './pool-list.query'
import { invalidatePoolParameters } from './pool-parameters.query'
import { invalidatePoolRewardsApy } from './pool-rewards-apy.query'
import { invalidatePoolTotalStaked } from './pool-total-staked.query'
import { invalidateUserPoolBalancesQuery } from './user-pool-balances.query'
import { invalidateUserPoolBoostQuery } from './user-pool-boost.query'
import { getUserPoolClaimablesQueryKey } from './user-pool-claimables.query'
import { invalidateUserPoolLiquidityUsdQuery } from './user-pool-liquidity-usd.query'
import { getUserPoolPositionsQueryKey, invalidateUserPoolPositions } from './user-pool-positions.query'
import { invalidateUserPoolRewardCrvApyQuery } from './user-pool-reward-crv-apy.query'
import { invalidateUserPoolShareQuery } from './user-pool-share.query'

/** Compatibility helper that refreshes user-pool-info method queries and the user's pool positions. */
export const invalidateUserPoolInfo = async (params: UserPoolParams) => {
  await Promise.all([
    invalidateUserPoolBalancesQuery(params),
    invalidateUserPoolLiquidityUsdQuery(params),
    invalidateUserPoolShareQuery(params),
    invalidateUserPoolRewardCrvApyQuery(params),
    invalidateUserPoolBoostQuery(params),
    invalidateUserPoolPositions(params),
    queryClient.resetQueries({ queryKey: getUserPoolClaimablesQueryKey(params) }),
  ])
}

export const invalidatePoolInfo = async (params: PoolParams) =>
  await Promise.all([
    invalidatePoolParameters(params),
    invalidatePoolCurrencyReserves(params),
    invalidatePoolGaugeStatus(params),
    invalidatePoolRewardsApy(params),
    invalidatePoolTotalStaked(params),
  ])

export const resetPoolLists = ({ chainId, userAddress }: UserChainParams) =>
  Promise.all(
    [
      getPoolListRootQueryKey({ chainId }),
      getLitePoolListQueryKey({ chainId }),
      getPoolChainsQueryKey({}),
      getLitePoolChainsQueryKey({}),
      getUserPoolClaimablesQueryKey({ chainId, userAddress }),
      getUserPoolPositionsQueryKey({ chainId, userAddress }),
      getCampaignsExternalQueryKey({}),
      getCampaignsPoolsMerklQueryKey({}),
    ].map(queryKey => queryClient.resetQueries({ queryKey })),
  )
