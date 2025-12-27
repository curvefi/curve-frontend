import * as api from '@/dex/entities/gauge/api'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/dex/entities/gauge/types'
import { queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import {
  gaugeAddRewardValidationSuite,
  gaugeDepositRewardApproveValidationSuite,
  gaugeDepositRewardValidationSuite,
} from './gauge-validation'
import { gaugeKeys } from './query-keys'
import { depositRewardAvailable, depositRewardIsApproved } from './query-options'

export const estimateGasDepositRewardApprove = queryFactory({
  queryKey: ({ rewardTokenId, amount, userBalance, ...gaugeParams }: DepositRewardApproveParams) =>
    [
      ...rootKeys.gauge({ ...gaugeParams }),
      ...gaugeKeys.estimateGas(),
      'depositRewardApprove',
      { rewardTokenId },
      { amount },
      { userBalance },
    ] as const,
  queryFn: api.queryEstimateGasDepositRewardApprove,
  refetchInterval: '1m',
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
})

export const estimateGasAddRewardToken = queryFactory({
  queryKey: ({ rewardTokenId, distributorId, ...gaugeParams }: AddRewardParams) =>
    [
      ...rootKeys.gauge({ ...gaugeParams }),
      ...gaugeKeys.estimateGas(),
      'addRewardToken',
      { rewardTokenId },
      { distributorId },
    ] as const,
  queryFn: api.queryEstimateGasAddRewardToken,
  refetchInterval: '1m',
  validationSuite: gaugeAddRewardValidationSuite,
  dependencies: (params: AddRewardParams) => [depositRewardAvailable.queryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
})

export const estimateGasDepositReward = queryFactory({
  queryKey: ({ rewardTokenId, amount, epoch, userBalance, ...gaugeParams }: DepositRewardParams) =>
    [
      ...rootKeys.gauge({ ...gaugeParams }),
      ...gaugeKeys.estimateGas(),
      'depositReward',
      { rewardTokenId },
      { amount },
      { epoch },
      { userBalance },
    ] as const,
  queryFn: api.queryEstimateGasDepositReward,
  refetchInterval: '1m',
  validationSuite: gaugeDepositRewardValidationSuite,
  dependencies: (params: DepositRewardParams) => [depositRewardIsApproved.queryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
})
