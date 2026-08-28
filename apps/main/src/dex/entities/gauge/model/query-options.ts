import { GaugeParams, rootKeys } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query/factory'
import { poolValidationSuite } from '@evm-ui/lib/model/query/pool-validation'
import {
  queryDepositRewardIsApproved,
  queryGaugeDistributors,
  queryGaugeManager,
  queryIsDepositRewardAvailable,
} from '../api'
import type { DepositRewardApproveParams, GaugeDistributorsParams } from '../types'
import { gaugeDepositRewardApproveValidationSuite, gaugeDistributorsValidationSuite } from './gauge-validation'

export const {
  useQuery: useIsDepositRewardAvailable,
  invalidate: invalidateDepositRewardAvailable,
  queryKey: getDepositRewardAvailableQueryKey,
} = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  queryFn: queryIsDepositRewardAvailable,
  validationSuite: poolValidationSuite,
  category: 'dex.gauge',
})

export const { useQuery: useGaugeManager } = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'manager'] as const,
  queryFn: queryGaugeManager,
  validationSuite: poolValidationSuite,
  category: 'dex.poolParams',
})

export const { useQuery: useGaugeRewardsDistributors, invalidate: invalidateGaugeDistributors } = queryFactory({
  queryKey: ({ userAddress, ...params }: GaugeDistributorsParams) =>
    [...rootKeys.gauge(params), ...rootKeys.user({ userAddress }), 'distributors'] as const,
  queryFn: queryGaugeDistributors,
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
  queryFn: queryDepositRewardIsApproved,
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  category: 'dex.deployGauge',
})
