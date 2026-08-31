import * as models from '@/dex/entities/gauge/model'
import { createApprovedEstimateGasHook, createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'

export const { useQuery: useIsDepositRewardAvailable } = models.depositRewardAvailable
export const { useQuery: useGaugeManager } = models.gaugeManager
export const { useQuery: useGaugeRewardsDistributors } = models.gaugeDistributors
export const { useQuery: useGaugeDepositRewardIsApproved } = models.depositRewardIsApproved
export const { useQuery: useEstimateGasAddRewardToken } = models.estimateGasAddRewardToken
export const { useQuery: useEstimateGasDepositRewardApprove } = models.estimateGasDepositRewardApprove
export const { useQuery: useEstimateGasDepositReward } = models.estimateGasDepositReward

export const useDepositRewardEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useGaugeDepositRewardIsApproved,
  useApproveEstimate: useEstimateGasDepositRewardApprove,
  useActionEstimate: useEstimateGasDepositReward,
})

export const useAddRewardTokenEstimateGas = createEstimateGasHook(useEstimateGasAddRewardToken)
