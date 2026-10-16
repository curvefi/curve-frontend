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
  queryKey: ({ chainId, poolAddress, rewardTokenId, amount, userBalance }: DepositRewardApproveParams) =>
    ({ name: 'estimateGas.depositRewardApprove', chainId, poolAddress, rewardTokenId, amount, userBalance }) as const,
  queryFn: async ({ poolAddress, rewardTokenId, amount }: DepositRewardApproveQuery) =>
    getGauge(poolAddress).estimateGas.depositRewardApprove(rewardTokenId, amount),
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

const { useQuery: useEstimateGasAddRewardToken } = queryFactory({
  queryKey: ({ chainId, poolAddress, rewardTokenId, distributorId }: AddRewardParams) =>
    ({ name: 'estimateGas.addRewardToken', chainId, poolAddress, rewardTokenId, distributorId }) as const,
  queryFn: async ({ poolAddress, rewardTokenId, distributorId }: AddRewardQuery) =>
    getGauge(poolAddress).estimateGas.addReward(rewardTokenId, distributorId),
  validationSuite: gaugeAddRewardValidationSuite,
  dependencies: (params: AddRewardParams) => [getDepositRewardAvailableQueryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

const { useQuery: useEstimateGasDepositReward } = queryFactory({
  queryKey: ({ chainId, poolAddress, rewardTokenId, amount, epoch, userBalance }: DepositRewardParams) =>
    ({ name: 'estimateGas.depositReward', chainId, poolAddress, rewardTokenId, amount, epoch, userBalance }) as const,
  queryFn: async ({ poolAddress, rewardTokenId, amount, epoch }: DepositRewardQuery) =>
    getGauge(poolAddress).estimateGas.depositReward(rewardTokenId, amount, epoch),
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
