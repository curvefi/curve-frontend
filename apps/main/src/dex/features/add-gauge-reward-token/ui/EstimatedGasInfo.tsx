import React from 'react'
import { useAddRewardTokenFormContext } from '@/dex/features/add-gauge-reward-token/lib'
import { useEstimateGasAddRewardToken } from '@/dex/entities/gauge'
import DetailInfoEstGas from '@/dex/components/DetailInfoEstGas'

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
