import type { PoolParams, UserChainParams, UserPoolParams } from '@evm-ui/queries/query-types'
import { resetCampaignsExternal } from '@ui/features/campaigns/campaigns-external.query'
import { resetCampaignsPoolsMerkl } from '@ui/features/campaigns/campaigns-pools-merkl.query'
import { resetLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { queryClient } from '@ui/features/queries/query-client'
import { resetPoolAddresses } from './pool-addresses.query'
import { invalidatePoolCurrencyReserves } from './pool-currency-reserves.query'
import { invalidatePoolIsGaugeKilled } from './pool-is-gauge-killed.query'
import { getPoolListRootQueryKey, resetPoolChains, resetLitePoolChains } from './pool-list.query'
import { invalidatePoolParameters } from './pool-parameters.query'
import { invalidatePoolRewardsApy } from './pool-rewards-apy.query'
import { invalidatePoolTotalStaked } from './pool-total-staked.query'
import { resetUserFullPoolPositions, invalidateUserFullPoolPositions } from './user-full-pool-positions.query'
import { resetUserLitePoolPositions, invalidateUserLitePoolPositions } from './user-lite-pool-positions.query'
import { invalidateUserPoolBalancesQuery } from './user-pool-balances.query'
import { invalidateUserPoolBoostQuery } from './user-pool-boost.query'
import { getUserPoolClaimablesQueryKey } from './user-pool-claimables.query'
import { invalidateUserPoolLiquidityUsdQuery } from './user-pool-liquidity-usd.query'
import { invalidateUserPoolShareQuery } from './user-pool-share.query'

/** Compatibility helper that refreshes user-pool-info method queries and the user's pool positions. */
export const invalidateUserPoolInfo = async (params: UserPoolParams) => {
  await Promise.all([
    invalidateUserPoolBalancesQuery(params),
    invalidateUserPoolLiquidityUsdQuery(params),
    invalidateUserPoolShareQuery(params),
    invalidateUserPoolBoostQuery(params),
    invalidateUserFullPoolPositions(params),
    invalidateUserLitePoolPositions(params),
    queryClient.invalidateQueries({ queryKey: [getUserPoolClaimablesQueryKey(params)] }),
  ])
}

export const invalidatePoolInfo = async (params: PoolParams) =>
  await Promise.all([
    invalidatePoolParameters(params),
    invalidatePoolCurrencyReserves(params),
    invalidatePoolIsGaugeKilled(params),
    invalidatePoolRewardsApy(params),
    invalidatePoolTotalStaked(params),
  ])

export const resetPoolLists = (params: UserChainParams) =>
  Promise.all([
    queryClient.resetQueries({ queryKey: [getPoolListRootQueryKey(params)] }),
    queryClient.resetQueries({ queryKey: [getUserPoolClaimablesQueryKey(params)] }),
    resetPoolAddresses(params),
    resetLitePoolList(params),
    resetPoolChains(params),
    resetLitePoolChains(params),
    resetUserFullPoolPositions(params),
    resetUserLitePoolPositions(params),
    resetCampaignsExternal(params),
    resetCampaignsPoolsMerkl(params),
  ])
