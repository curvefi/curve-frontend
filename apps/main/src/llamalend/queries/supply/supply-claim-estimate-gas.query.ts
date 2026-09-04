import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { combineQueries } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/lib/model/query/root-keys'
import type { Query } from '@ui/features/queries/util'
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

/** Like `createEstimateGasHook`, but first fetches claimable rewards and skips gas estimation when none exist. */
const createClaimEstimateGasHook = <T>(
  useClaimable: (query: ClaimEstimateParams, enabled?: boolean) => Query<T>,
  useEstimateGasQuery: (query: ClaimEstimateParams, enabled?: boolean) => Query<TGas>,
  isClaimEnabled: (claimable: T | undefined) => boolean,
) =>
  createEstimateGasHook((query: ClaimEstimateParams, enabled?: boolean) => {
    const claimable = useClaimable(query, enabled)
    const estimateGas = useEstimateGasQuery(query, enabled && isClaimEnabled(claimable.data))

    return combineQueries([claimable, estimateGas], (_, estimateGas) => estimateGas)
  })

/** Estimates claim-CRV gas only when the user has claimable CRV. */
export const useClaimCrvEstimateGas = createClaimEstimateGasHook(
  useClaimableCrv,
  useClaimCrvEstimateGasQuery,
  claimable => Number(claimable) > 0,
)

/** Estimates claim-rewards gas only when the user has claimable rewards. */
export const useClaimRewardsEstimateGas = createClaimEstimateGasHook(
  useClaimableRewards,
  useClaimRewardsEstimateQuery,
  hasClaimableRewards,
)
