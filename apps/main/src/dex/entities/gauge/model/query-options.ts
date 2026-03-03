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
  validationSuite: poolValidationSuite,
  category: 'dex.gauge',
})

export const gaugeManager = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'manager'] as const,
  queryFn: queryGaugeManager,
  validationSuite: poolValidationSuite,
  category: 'dex.poolParams',
})

export const gaugeDistributors = queryFactory({
  queryKey: ({ userAddress, ...params }: GaugeDistributorsParams) =>
    [...rootKeys.gauge(params), ...rootKeys.user({ userAddress }), 'distributors'] as const,
  queryFn: queryGaugeDistributors,
  validationSuite: gaugeDistributorsValidationSuite,
  category: 'dex.gauge',
})

export const depositRewardIsApproved = queryFactory({
  queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositRewardIsApproved', { rewardTokenId }, { amount }] as const,
  queryFn: queryDepositRewardIsApproved,
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  category: 'dex.deployGauge',
})
