import { GaugeParams, rootKeys } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { poolValidationSuite } from '@ui-kit/lib/model/query/pool-validation'
import {
  queryDepositRewardIsApproved,
  queryGaugeDistributors,
  queryGaugeManager,
  queryIsDepositRewardAvailable,
} from '../api'
import type { DepositRewardApproveParams, GaugeDistributorsParams } from '../types'
import { gaugeDepositRewardApproveValidationSuite, gaugeDistributorsValidationSuite } from './gauge-validation'

export const depositRewardAvailable = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  queryFn: queryIsDepositRewardAvailable,
  staleTime: '5m',
  validationSuite: poolValidationSuite,
})

export const gaugeManager = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'manager'] as const,
  queryFn: queryGaugeManager,
  staleTime: 'Inf',
  validationSuite: poolValidationSuite,
})

export const gaugeDistributors = queryFactory({
  queryKey: ({ userAddress, ...params }: GaugeDistributorsParams) =>
    [...rootKeys.gauge(params), ...rootKeys.user({ userAddress }), 'distributors'] as const,
  queryFn: queryGaugeDistributors,
  staleTime: '5m',
  validationSuite: gaugeDistributorsValidationSuite,
})

export const depositRewardIsApproved = queryFactory({
  queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositRewardIsApproved', { rewardTokenId }, { amount }] as const,
  queryFn: queryDepositRewardIsApproved,
  staleTime: '1h',
  validationSuite: gaugeDepositRewardApproveValidationSuite,
})
