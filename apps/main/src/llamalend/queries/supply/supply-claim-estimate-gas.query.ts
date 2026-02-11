import { sum } from 'lodash'
import { useMemo } from 'react'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { claimableRewardsValidationSuite, requireGauge, requireVault } from '../validation/supply.validation'
import { ClaimableReward, useClaimableCrv, useClaimableRewards } from './supply-claimable-rewards.query'

type ClaimEstimateParams<ChainId = number> = UserMarketParams<ChainId>
type ClaimEstimateQuery = UserMarketQuery

const hasClaimableRewards = (claimableRewards: ClaimableReward[] | undefined) =>
  sum(claimableRewards?.map((r) => Number(r.amount))) > 0

export const { useQuery: useClaimCrvEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: ClaimEstimateParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.claimCrv'] as const,
  queryFn: async ({ marketId }: ClaimEstimateQuery) => await requireVault(marketId).vault.estimateGas.claimCrv(),
  validationSuite: claimableRewardsValidationSuite,
})

export const { useQuery: useClaimRewardsEstimateQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: ClaimEstimateParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.claimRewards'] as const,
  queryFn: async ({ marketId }: ClaimEstimateQuery) => await requireGauge(marketId).vault.estimateGas.claimRewards(),
  validationSuite: claimableRewardsValidationSuite,
})

// `createApprovedEstimateGasHook` does not fit here because claim has no approval step and can include
// two independent action transactions in one flow (`claimCrv` and `claimRewards`). We need to fetch each
// estimate conditionally and sum both when applicable before converting to gas cost.
export const useClaimEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: ClaimEstimateParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: claimableCrv,
    isLoading: claimableCrvLoading,
    error: claimableCrvError,
  } = useClaimableCrv(query, enabled)
  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useClaimableRewards(query, enabled)
  const {
    data: crvEstimate,
    isLoading: crvLoading,
    error: crvError,
  } = useClaimCrvEstimateGasQuery(query, enabled && Number(claimableCrv) > 0)
  const {
    data: rewardsEstimate,
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useClaimRewardsEstimateQuery(query, enabled && hasClaimableRewards(claimableRewards))

  const totalEstimate = useMemo(
    () => (crvEstimate || rewardsEstimate ? Number(crvEstimate ?? 0) + Number(rewardsEstimate ?? 0) : undefined),
    [crvEstimate, rewardsEstimate],
  )

  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas(networks, chainId, totalEstimate, enabled && totalEstimate != null)

  return {
    data,
    isLoading: [claimableCrvLoading, claimableRewardsLoading, crvLoading, rewardsLoading, conversionLoading].some(
      Boolean,
    ),
    error: [claimableCrvError, claimableRewardsError, crvError, rewardsError, estimateError].find(Boolean),
  }
}
