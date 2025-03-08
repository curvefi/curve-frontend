import { GaugeParams, rootKeys } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { poolValidationSuite } from '@ui-kit/lib/model/query/pool-validation'
import {
  queryDepositRewardIsApproved,
  queryGaugeDistributors,
  queryGaugeManager,
  queryIsDepositRewardAvailable,
} from '../api'
import type { DepositRewardApproveParams } from '../types'
import { gaugeDepositRewardApproveValidationSuite } from './gauge-validation'

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
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'distributors'] as const,
  queryFn: queryGaugeDistributors,
  staleTime: '5m',
  validationSuite: poolValidationSuite,
})

export const depositRewardIsApproved = queryFactory({
  queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositRewardIsApproved', { rewardTokenId }, { amount }] as const,
  queryFn: queryDepositRewardIsApproved,
  staleTime: '1h',
  validationSuite: gaugeDepositRewardApproveValidationSuite,
})
