import {
  useEstimateGasAddRewardToken,
  useEstimateGasDepositReward,
  useEstimateGasDepositRewardApprove,
  useGaugeDepositRewardIsApproved,
} from '@/dex/entities/gauge/model'
import { createApprovedEstimateGasHook, createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'

export const useDepositRewardEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useGaugeDepositRewardIsApproved,
  useApproveEstimate: useEstimateGasDepositRewardApprove,
  useActionEstimate: useEstimateGasDepositReward,
})

export const useAddRewardTokenEstimateGas = createEstimateGasHook(useEstimateGasAddRewardToken)
