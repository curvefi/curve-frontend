import React from 'react'
import { useFormContext } from 'react-hook-form'
import DetailInfoEstGas from '@/dex/components/DetailInfoEstGas'
import { DepositRewardStep, type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { useEstimateGasDepositReward, useEstimateGasDepositRewardApprove } from '@/dex/entities/gauge'
import { FlexContainer } from '@ui/styled-containers'
import { ChainId } from '@/dex/types/main.types'

export const GasEstimation: React.FC<{
  chainId: ChainId
  poolId: string
}> = ({ chainId, poolId }) => {
  const {
    watch,
    formState: { isValid },
  } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')
  const epoch = watch('epoch')
  const step = watch('step')

  const {
    data: estimatedGasDepositRewardApprove,
    isLoading: isLoadingGasEstimateDepositRewardApprove,
    isFetching: isFetchingGasEstimateDepositRewardApprove,
  } = useEstimateGasDepositRewardApprove(
    { chainId, poolId, rewardTokenId, amount },
    step === DepositRewardStep.APPROVAL && isValid,
  )

  const {
    data: estimatedGasDepositReward,
    isLoading: isLoadingGasEstimateDepositReward,
    isFetching: isFetchingGasEstimateDepositReward,
  } = useEstimateGasDepositReward(
    {
      chainId,
      poolId,
      rewardTokenId,
      amount,
      epoch,
    },
    step === DepositRewardStep.DEPOSIT && isValid,
  )

  return (
    <FlexContainer>
      {step === DepositRewardStep.APPROVAL && (
        <DetailInfoEstGas
          chainId={chainId}
          estimatedGas={estimatedGasDepositRewardApprove ?? null}
          loading={(isLoadingGasEstimateDepositRewardApprove || isFetchingGasEstimateDepositRewardApprove) && isValid}
        />
      )}
      {step === DepositRewardStep.DEPOSIT && (
        <DetailInfoEstGas
          chainId={chainId}
          estimatedGas={estimatedGasDepositReward ?? null}
          loading={(isLoadingGasEstimateDepositReward || isFetchingGasEstimateDepositReward) && isValid}
        />
      )}
    </FlexContainer>
  )
}
