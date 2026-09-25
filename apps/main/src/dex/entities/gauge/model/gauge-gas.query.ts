import { getGauge } from '@/dex/entities/gauge/lib/gauge-info'
import type {
  AddRewardParams,
  AddRewardQuery,
  DepositRewardApproveParams,
  DepositRewardApproveQuery,
  DepositRewardParams,
  DepositRewardQuery,
} from '@/dex/entities/gauge/types'
import { createApprovedEstimateGasHook, createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import {
  gaugeAddRewardValidationSuite,
  gaugeDepositRewardApproveValidationSuite,
  gaugeDepositRewardValidationSuite,
} from './gauge-validation'
import {
  getDepositRewardAvailableQueryKey,
  getDepositRewardIsApprovedQueryKey,
  useGaugeDepositRewardIsApproved,
} from './gauge.query'

const { useQuery: useEstimateGasDepositRewardApprove } = queryFactory({
  queryKey: ({ rewardTokenId, amount, userBalance, ...gaugeParams }: DepositRewardApproveParams) =>
    [
      rootKeys.gauge({ ...gaugeParams }),
      { name: 'estimateGas.depositRewardApprove', rewardTokenId, amount, userBalance },
    ] as const,
  queryFn: async ({ poolId, rewardTokenId, amount }: DepositRewardApproveQuery) =>
    getGauge(poolId).estimateGas.depositRewardApprove(rewardTokenId, amount),
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

const { useQuery: useEstimateGasAddRewardToken } = queryFactory({
  queryKey: ({ rewardTokenId, distributorId, ...gaugeParams }: AddRewardParams) =>
    [rootKeys.gauge({ ...gaugeParams }), { name: 'estimateGas.addRewardToken', rewardTokenId, distributorId }] as const,
  queryFn: async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery) =>
    getGauge(poolId).estimateGas.addReward(rewardTokenId, distributorId),
  validationSuite: gaugeAddRewardValidationSuite,
  dependencies: (params: AddRewardParams) => [getDepositRewardAvailableQueryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

const { useQuery: useEstimateGasDepositReward } = queryFactory({
  queryKey: ({ rewardTokenId, amount, epoch, userBalance, ...gaugeParams }: DepositRewardParams) =>
    [
      rootKeys.gauge({ ...gaugeParams }),
      { name: 'estimateGas.depositReward', rewardTokenId, amount, epoch, userBalance },
    ] as const,
  queryFn: async ({ poolId, rewardTokenId, amount, epoch }: DepositRewardQuery) =>
    getGauge(poolId).estimateGas.depositReward(rewardTokenId, amount, epoch),
  validationSuite: gaugeDepositRewardValidationSuite,
  dependencies: (params: DepositRewardParams) => [getDepositRewardIsApprovedQueryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

export const useDepositRewardEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useGaugeDepositRewardIsApproved,
  useApproveEstimate: useEstimateGasDepositRewardApprove,
  useActionEstimate: useEstimateGasDepositReward,
})

export const useAddRewardTokenEstimateGas = createEstimateGasHook(useEstimateGasAddRewardToken)
