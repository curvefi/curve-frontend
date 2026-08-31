import {
  useEstimateGasAddRewardToken,
  useEstimateGasDepositReward,
  useEstimateGasDepositRewardApprove,
  useGaugeDepositRewardIsApproved,
} from '@/dex/entities/gauge/model'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { createApprovedEstimateGasHook, createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'

export const getGauge = (poolId: string) => requireLib('curveApi').getPool(poolId).gauge

export const useDepositRewardEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useGaugeDepositRewardIsApproved,
  useApproveEstimate: useEstimateGasDepositRewardApprove,
  useActionEstimate: useEstimateGasDepositReward,
})

export const useAddRewardTokenEstimateGas = createEstimateGasHook(useEstimateGasAddRewardToken)
