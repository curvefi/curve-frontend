import type { Address } from 'viem'
import { getGauge } from '@/dex/entities/gauge/lib/gauge-info'
import { GaugeParams, GaugeQuery, rootKeys } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query/factory'
import { poolValidationSuite } from '@evm-ui/lib/model/query/pool-validation'
import { ZERO_ADDRESS as zeroAddress } from '@primitives/address.utils'
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
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  queryFn: async ({ poolId }: GaugeQuery) => getGauge(poolId).isDepositRewardAvailable(),
  validationSuite: poolValidationSuite,
  category: 'dex.gauge',
})

export const { useQuery: useGaugeManager } = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'manager'] as const,
  queryFn: async ({ poolId }: GaugeQuery): Promise<Address | null> => {
    const gaugeManager = (await getGauge(poolId).gaugeManager()) as Address | null
    return gaugeManager === zeroAddress ? null : gaugeManager
  },
  validationSuite: poolValidationSuite,
  category: 'dex.poolParams',
})

export const { useQuery: useGaugeRewardsDistributors, invalidate: invalidateGaugeDistributors } = queryFactory({
  queryKey: ({ userAddress, ...params }: GaugeDistributorsParams) =>
    [...rootKeys.gauge(params), ...rootKeys.user({ userAddress }), 'distributors'] as const,
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
  queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositRewardIsApproved', { rewardTokenId }, { amount }] as const,
  queryFn: async ({ poolId, amount, rewardTokenId }: DepositRewardApproveQuery) =>
    getGauge(poolId).depositRewardIsApproved(rewardTokenId, amount),
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  category: 'dex.deployGauge',
})
