import { type Address, zeroAddress } from 'viem'
import { getGauge } from '@/dex/entities/gauge/lib/gauge-info'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { GaugeParams, GaugeQuery } from '@evm-ui/queries/query-types'
import { poolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import {
  type DepositRewardApproveParams,
  DepositRewardApproveQuery,
  type GaugeDistributorsParams,
  type GaugeDistributorsQuery,
} from '../types'
import { gaugeDepositRewardApproveValidationSuite, gaugeDistributorsValidationSuite } from './gauge-validation'

export const {
  useQuery: useIsDepositRewardAvailable,
  invalidate: invalidateDepositRewardAvailable,
  queryKey: getDepositRewardAvailableQueryKey,
} = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: GaugeParams) =>
    ({ name: 'isDepositRewardAvailable', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: GaugeQuery) => getGauge(poolAddress).isDepositRewardAvailable(),
  validationSuite: poolValidationSuite,
  category: 'dex.gauge',
})

export const { useQuery: useGaugeManager } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: GaugeParams) => ({ name: 'manager', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: GaugeQuery): Promise<Address | null> => {
    const gaugeManager = (await getGauge(poolAddress).gaugeManager()) as Address | null
    return gaugeManager === zeroAddress ? null : gaugeManager
  },
  validationSuite: poolValidationSuite,
  category: 'dex.poolParams',
})

export const { useQuery: useGaugeRewardsDistributors, invalidate: invalidateGaugeDistributors } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress }: GaugeDistributorsParams) =>
    ({ name: 'distributors', chainId, poolAddress, userAddress }) as const,
  queryFn: async ({ poolAddress }: GaugeDistributorsQuery) =>
    (await getGauge(poolAddress).gaugeDistributors()) as Record<Address, Address>,
  validationSuite: gaugeDistributorsValidationSuite,
  category: 'dex.gauge',
})

export const {
  useQuery: useGaugeDepositRewardIsApproved,
  fetchQuery: fetchDepositRewardIsApproved,
  queryKey: getDepositRewardIsApprovedQueryKey,
} = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, rewardTokenId, amount }: DepositRewardApproveParams) =>
    ({ name: 'depositRewardIsApproved', chainId, poolAddress, rewardTokenId, amount }) as const,
  queryFn: async ({ poolAddress, amount, rewardTokenId }: DepositRewardApproveQuery) =>
    getGauge(poolAddress).depositRewardIsApproved(rewardTokenId, amount),
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  category: 'dex.deployGauge',
})
