import { useFormContext } from 'react-hook-form'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { useEstimateGasDepositReward, useEstimateGasDepositRewardApprove } from '@/dex/entities/gauge'
import { DepositRewardStep, type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { ChainId } from '@/dex/types/main.types'
import { FlexContainer } from '@ui/styled-containers'

export const GasEstimation = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const {
    watch,
    formState: { isValid },
  } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')
  const epoch = watch('epoch')
  const step = watch('step')
  const userBalance = watch('userBalance')

  const {
    data: estimatedGasDepositRewardApprove,
    isLoading: isLoadingGasEstimateDepositRewardApprove,
    isFetching: isFetchingGasEstimateDepositRewardApprove,
  } = useEstimateGasDepositRewardApprove(
    { chainId, poolId, rewardTokenId, amount, userBalance },
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
      userBalance,
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
