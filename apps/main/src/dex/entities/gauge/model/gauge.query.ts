import { type Address, zeroAddress } from 'viem'
import { getGauge } from '@/dex/entities/gauge/lib/gauge-info'
import { GaugeParams, GaugeQuery, rootKeys } from '@evm-ui/queries/root-keys'
import { poolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'
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
} = queryFactory({
  queryKey: ({ chainId, poolId }: GaugeParams) => ({
    ...rootKeys.gauge({ chainId, poolId }),
    name: 'isDepositRewardAvailable',
  }),
  queryFn: async ({ poolId }: GaugeQuery) => getGauge(poolId).isDepositRewardAvailable(),
  validationSuite: poolValidationSuite,
  category: 'dex.gauge',
})

export const { useQuery: useGaugeManager } = queryFactory({
  queryKey: ({ chainId, poolId }: GaugeParams) => ({ ...rootKeys.gauge({ chainId, poolId }), name: 'manager' }),
  queryFn: async ({ poolId }: GaugeQuery): Promise<Address | null> => {
    const gaugeManager = (await getGauge(poolId).gaugeManager()) as Address | null
    return gaugeManager === zeroAddress ? null : gaugeManager
  },
  validationSuite: poolValidationSuite,
  category: 'dex.poolParams',
})

export const { useQuery: useGaugeRewardsDistributors, invalidate: invalidateGaugeDistributors } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: GaugeDistributorsParams) => ({
    ...rootKeys.gauge({ chainId, poolId }),
    ...rootKeys.user({ userAddress }),
    name: 'distributors',
  }),
  queryFn: async ({ poolId }: GaugeDistributorsQuery) =>
    (await getGauge(poolId).gaugeDistributors()) as Record<Address, Address>,
  validationSuite: gaugeDistributorsValidationSuite,
  category: 'dex.gauge',
})

export const {
  useQuery: useGaugeDepositRewardIsApproved,
  fetchQuery: fetchDepositRewardIsApproved,
  queryKey: getDepositRewardIsApprovedQueryKey,
} = queryFactory({
  queryKey: ({ chainId, poolId, rewardTokenId, amount }: DepositRewardApproveParams) => ({
    ...rootKeys.gauge({ chainId, poolId }),
    name: 'depositRewardIsApproved',
    rewardTokenId,
    amount,
  }),
  queryFn: async ({ poolId, amount, rewardTokenId }: DepositRewardApproveQuery) =>
    getGauge(poolId).depositRewardIsApproved(rewardTokenId, amount),
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  category: 'dex.deployGauge',
})
