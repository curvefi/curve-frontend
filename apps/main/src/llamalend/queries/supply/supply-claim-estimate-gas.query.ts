import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { combineQueries } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/lib/model/query/root-keys'
import { q, QueryProp } from '@evm-ui/types/util'
import { claimableRewardsValidationSuite, requireGauge, requireVault } from '../validation/supply.validation'
import { useClaimableCrv, useClaimableRewards } from './supply-claimable-rewards.query'
import { hasClaimableRewards } from './supply-query.helpers'

type ClaimEstimateParams<ChainId = number> = UserMarketParams<ChainId>
type ClaimEstimateQuery = UserMarketQuery

const { useQuery: useClaimCrvEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: ClaimEstimateParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.claimCrv'] as const,
  queryFn: async ({ marketId }: ClaimEstimateQuery) => await requireVault(marketId).vault.estimateGas.claimCrv(),
  category: 'llamalend.supply',
  validationSuite: claimableRewardsValidationSuite,
})

const { useQuery: useClaimRewardsEstimateQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: ClaimEstimateParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.claimRewards'] as const,
  queryFn: async ({ marketId }: ClaimEstimateQuery) => await requireGauge(marketId).vault.estimateGas.claimRewards(),
  category: 'llamalend.supply',
  validationSuite: claimableRewardsValidationSuite,
})

const useClaimEstimateGas = <ChainId extends IChainId, T>(
  networks: NetworkDict<ChainId>,
  query: ClaimEstimateParams<ChainId>,
  claimable: QueryProp<T>,
  claimableEstimateGas: QueryProp<TGas>,
  enabled = true,
) => {
  const { chainId } = query
  const gas = useEstimateGas(networks, chainId, claimableEstimateGas, enabled)
  return combineQueries([claimable, gas], (_, gas) => gas)
}

export const useClaimCrvEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: ClaimEstimateParams<ChainId>,
  enabled = true,
) => {
  const claimableCrv = useClaimableCrv(query, enabled)
  const isClaimCrvEnabled = enabled && Number(claimableCrv.data) > 0

  return useClaimEstimateGas(
    networks,
    query,
    q(claimableCrv),
    q(useClaimCrvEstimateGasQuery(query, isClaimCrvEnabled)),
    isClaimCrvEnabled,
  )
}

export const useClaimRewardsEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: ClaimEstimateParams<ChainId>,
  enabled = true,
) => {
  const claimableRewards = useClaimableRewards(query, enabled)
  const isClaimRewardsEnabled = enabled && hasClaimableRewards(claimableRewards.data)

  return useClaimEstimateGas(
    networks,
    query,
    q(claimableRewards),
    q(useClaimRewardsEstimateQuery(query, isClaimRewardsEnabled)),
    isClaimRewardsEnabled,
  )
}
