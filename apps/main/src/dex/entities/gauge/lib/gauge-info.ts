import {
  useEstimateGasAddRewardToken,
  useEstimateGasDepositReward,
  useEstimateGasDepositRewardApprove,
  useGaugeDepositRewardIsApproved,
  useGaugeManager,
  useGaugeRewardsDistributors,
  useIsDepositRewardAvailable,
} from '@/dex/entities/gauge/model'
import { createApprovedEstimateGasHook, createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'

export {
  useEstimateGasAddRewardToken,
  useEstimateGasDepositReward,
  useEstimateGasDepositRewardApprove,
  useGaugeDepositRewardIsApproved,
  useGaugeManager,
  useGaugeRewardsDistributors,
  useIsDepositRewardAvailable,
}

export const useDepositRewardEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useGaugeDepositRewardIsApproved,
  useApproveEstimate: useEstimateGasDepositRewardApprove,
  useActionEstimate: useEstimateGasDepositReward,
})

export const useAddRewardTokenEstimateGas = createEstimateGasHook(useEstimateGasAddRewardToken)
