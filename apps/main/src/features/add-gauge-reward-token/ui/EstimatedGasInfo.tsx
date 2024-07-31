import React from 'react'
import DetailInfoEstGas from '@/components/DetailInfoEstGas'
import { useAddRewardTokenFormContext } from '@/features/add-gauge-reward-token/lib'
import { useEstimateGasAddRewardToken } from '@/entities/gauge'

export const EstimatedGasInfo: React.FC<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const {
    watch,
    formState: { isValid },
  } = useAddRewardTokenFormContext()

  const rewardTokenId = watch('rewardTokenId')
  const distributorId = watch('distributorId')
  const { data: estimatedGas, isPending: isPendingGasEstimate } = useEstimateGasAddRewardToken({
    chainId,
    poolId,
    rewardTokenId,
    distributorId,
  })

  return (
    <DetailInfoEstGas chainId={chainId} estimatedGas={estimatedGas ?? null} loading={isPendingGasEstimate && isValid} />
  )
}
