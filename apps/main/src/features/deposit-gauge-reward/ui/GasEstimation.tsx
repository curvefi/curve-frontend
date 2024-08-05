import DetailInfoEstGas from '@/components/DetailInfoEstGas'
import { useEstimateGasDepositReward, useEstimateGasDepositRewardApprove } from '@/entities/gauge'
import { FlexContainer } from '@/shared/ui/styled-containers'
import { DepositRewardStep, type DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import React from 'react'
import { useFormContext } from 'react-hook-form'

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

  const { data: estimatedGasDepositRewardApprove, isLoading: isLoadingGasEstimateDepositRewardApprove } =
    useEstimateGasDepositRewardApprove({ chainId, poolId, rewardTokenId, amount })

  const { data: estimatedGasDepositReward, isLoading: isLoadingGasEstimateDepositReward } = useEstimateGasDepositReward(
    {
      chainId,
      poolId,
      rewardTokenId,
      amount,
      epoch,
    }
  )

  return (
    <FlexContainer>
      {step === DepositRewardStep.APPROVAL && (
        <DetailInfoEstGas
          chainId={chainId}
          estimatedGas={estimatedGasDepositRewardApprove ?? null}
          loading={isLoadingGasEstimateDepositRewardApprove && isValid}
        />
      )}
      {step === DepositRewardStep.DEPOSIT && (
        <DetailInfoEstGas
          chainId={chainId}
          estimatedGas={estimatedGasDepositReward ?? null}
          loading={isLoadingGasEstimateDepositReward && isValid}
        />
      )}
    </FlexContainer>
  )
}
