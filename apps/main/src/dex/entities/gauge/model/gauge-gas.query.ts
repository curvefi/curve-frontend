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
  queryKey: ({ chainId, poolId, rewardTokenId, amount, userBalance }: DepositRewardApproveParams) => ({
    name: 'estimateGas.depositRewardApprove',
    chainId,
    poolId,
    rewardTokenId,
    amount,
    userBalance,
  }),
  queryFn: async ({ poolId, rewardTokenId, amount }: DepositRewardApproveQuery) =>
    getGauge(poolId).estimateGas.depositRewardApprove(rewardTokenId, amount),
  validationSuite: gaugeDepositRewardApproveValidationSuite,
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

const { useQuery: useEstimateGasAddRewardToken } = queryFactory({
  queryKey: ({ chainId, poolId, rewardTokenId, distributorId }: AddRewardParams) => ({
    name: 'estimateGas.addRewardToken',
    chainId,
    poolId,
    rewardTokenId,
    distributorId,
  }),
  queryFn: async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery) =>
    getGauge(poolId).estimateGas.addReward(rewardTokenId, distributorId),
  validationSuite: gaugeAddRewardValidationSuite,
  dependencies: (params: AddRewardParams) => [getDepositRewardAvailableQueryKey(params)],
  refetchOnWindowFocus: 'always',
  refetchOnMount: 'always',
  category: 'dex.deployGauge',
})

const { useQuery: useEstimateGasDepositReward } = queryFactory({
  queryKey: ({ chainId, poolId, rewardTokenId, amount, epoch, userBalance }: DepositRewardParams) => ({
    name: 'estimateGas.depositReward',
    chainId,
    poolId,
    rewardTokenId,
    amount,
    epoch,
    userBalance,
  }),
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
