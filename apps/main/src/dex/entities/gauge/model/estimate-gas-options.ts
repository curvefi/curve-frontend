import * as api from '@/dex/entities/gauge/api'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/dex/entities/gauge/types'
import { queryFactory, rootKeys } from '@evm-ui/lib/model/query'
import {
  gaugeAddRewardValidationSuite,
  gaugeDepositRewardApproveValidationSuite,
  gaugeDepositRewardValidationSuite,
} from './gauge-validation'
import { gaugeKeys } from './query-keys'
import { getDepositRewardAvailableQueryKey, getDepositRewardIsApprovedQueryKey } from './query-options'

export const { useQuery: useEstimateGasDepositRewardApprove } = queryFactory({
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
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

export const { useQuery: useEstimateGasAddRewardToken } = queryFactory({
  queryKey: ({ rewardTokenId, distributorId, ...gaugeParams }: AddRewardParams) =>
    [
      ...rootKeys.gauge({ ...gaugeParams }),
      ...gaugeKeys.estimateGas(),
      'addRewardToken',
      { rewardTokenId },
      { distributorId },
    ] as const,
  queryFn: api.queryEstimateGasAddRewardToken,
  validationSuite: gaugeAddRewardValidationSuite,
  dependencies: (params: AddRewardParams) => [getDepositRewardAvailableQueryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

export const { useQuery: useEstimateGasDepositReward } = queryFactory({
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
  validationSuite: gaugeDepositRewardValidationSuite,
  dependencies: (params: DepositRewardParams) => [getDepositRewardIsApprovedQueryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})
