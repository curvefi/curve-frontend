import React from 'react'
import { useAddRewardTokenFormContext } from '@main/features/add-gauge-reward-token/lib'
import { useEstimateGasAddRewardToken } from '@main/entities/gauge'
import DetailInfoEstGas from '@main/components/DetailInfoEstGas'
import { ChainId } from '@main/types/main.types'

export const EstimatedGasInfo: React.FC<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const {
    watch,
    formState: { isValid },
  } = useAddRewardTokenFormContext()

  const rewardTokenId = watch('rewardTokenId')
  const distributorId = watch('distributorId')
  const { data: estimatedGas, isFetching: isFetchingGasEstimate } = useEstimateGasAddRewardToken(
    {
      chainId,
      poolId,
      rewardTokenId,
      distributorId,
    },
    isValid,
  )

  return (
    <DetailInfoEstGas
      chainId={chainId}
      estimatedGas={estimatedGas ?? null}
      loading={isFetchingGasEstimate && isValid}
    />
  )
}
