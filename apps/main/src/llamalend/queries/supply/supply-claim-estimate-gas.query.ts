import { createClaimEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import { claimableRewardsValidationSuite, requireGauge, requireVault } from '../validation/supply.validation'
import { useClaimableCrv, useClaimableRewards } from './supply-claimable-rewards.query'
import { hasClaimableRewards } from './supply-query.helpers'

type ClaimEstimateParams<ChainId = number> = UserMarketParams<ChainId>
type ClaimEstimateQuery = UserMarketQuery

const { useQuery: useClaimCrvEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: ClaimEstimateParams) => ({
    name: 'estimateGas.claimCrv',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
  }),
  queryFn: async ({ marketId }: ClaimEstimateQuery) => await requireVault(marketId).vault.estimateGas.claimCrv(),
  category: 'llamalend.supply',
  validationSuite: claimableRewardsValidationSuite,
})

const { useQuery: useClaimRewardsEstimateQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: ClaimEstimateParams) => ({
    name: 'estimateGas.claimRewards',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
  }),
  queryFn: async ({ marketId }: ClaimEstimateQuery) => await requireGauge(marketId).vault.estimateGas.claimRewards(),
  category: 'llamalend.supply',
  validationSuite: claimableRewardsValidationSuite,
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
