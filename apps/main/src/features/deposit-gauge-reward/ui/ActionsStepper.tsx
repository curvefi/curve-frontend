import { useDepositReward, useDepositRewardApprove, useGaugeDepositRewardIsApproved } from '@/entities/gauge'
import { DepositRewardFormValues, DepositRewardStep } from '@/features/deposit-gauge-reward/types'
import { StepperContainer } from '@/features/deposit-gauge-reward/ui'
import networks from '@/networks'
import Stepper from '@/ui/Stepper'
import { getStepStatus } from '@/ui/Stepper/helpers'
import type { Step } from '@/ui/Stepper/types'
import TxInfoBar from '@/ui/TxInfoBar'
import { t } from '@lingui/macro'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

export const DepositStepper: React.FC<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const {
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    getValues,
    setError,
    reset,
    handleSubmit,
  } = useFormContext<DepositRewardFormValues>()

  const amount = watch('amount')
  const rewardTokenId = watch('rewardTokenId')
  const step = watch('step')

  const {
    mutate: depositRewardApprove,
    isPending: isPendingDepositRewardApprove,
    isSuccess: isSuccessDepositRewardApprove,
    data: depositRewardApproveData,
  } = useDepositRewardApprove({ chainId, poolId })

  const {
    mutate: depositReward,
    isPending: isPendingDepositReward,
    isSuccess: isSuccessDepositReward,
    data: depositRewardData,
  } = useDepositReward({ chainId, poolId })

  const onSubmitApproval = useCallback(() => {
    const onApproveSuccess = () => {
      setValue('step', DepositRewardStep.DEPOSIT, { shouldValidate: true })
    }

    const onApproveError = (error: Error) => {
      setError('root.serverError', error)
    }

    depositRewardApprove(
      {
        rewardTokenId: getValues('rewardTokenId'),
        amount: getValues('amount'),
      },
      { onSuccess: onApproveSuccess, onError: onApproveError }
    )
  }, [depositRewardApprove, getValues, setError, setValue])

  const onSubmitDeposit = useCallback(() => {
    depositReward(
      {
        rewardTokenId: getValues('rewardTokenId'),
        amount: getValues('amount'),
        epoch: getValues('epoch'),
      },
      {
        onSuccess: () => {
          reset()
          setValue('step', DepositRewardStep.CONFIRMATION, { shouldValidate: true })
        },
        onError: (error: Error) => {
          setError('root.serverError', error)
        },
      }
    )
  }, [depositReward, getValues, reset, setError, setValue])

  const { data: isDepositRewardApproved, isLoading: isLoadingDepositRewardApproved } = useGaugeDepositRewardIsApproved({
    chainId,
    poolId,
    rewardTokenId,
    amount,
  })

  const steps = useMemo<Step[]>(() => {
    return [
      {
        key: 'APPROVAL',
        status: getStepStatus(
          isValid && !isLoadingDepositRewardApproved && !!isDepositRewardApproved,
          step === DepositRewardStep.APPROVAL && (isSubmitting || isPendingDepositRewardApprove),
          isValid && !isSubmitting
        ),
        type: 'action',
        content:
          !isLoadingDepositRewardApproved && isDepositRewardApproved ? t`Spending Approved` : t`Approve Spending`,
        onClick: handleSubmit(onSubmitApproval),
      },
      {
        key: 'DEPOSIT',
        status: getStepStatus(
          step === DepositRewardStep.CONFIRMATION,
          step === DepositRewardStep.DEPOSIT && isPendingDepositReward,
          isValid && !isPendingDepositReward && !!isDepositRewardApproved
        ),
        type: 'action',
        content: step === DepositRewardStep.CONFIRMATION ? t`Deposited` : t`Deposit`,
        onClick: handleSubmit(onSubmitDeposit),
      },
    ]
  }, [
    isLoadingDepositRewardApproved,
    isDepositRewardApproved,
    step,
    isSubmitting,
    isValid,
    isPendingDepositRewardApprove,
    handleSubmit,
    onSubmitApproval,
    isPendingDepositReward,
    onSubmitDeposit,
  ])

  return (
    <>
      <StepperContainer>
        <Stepper steps={steps} testId="deposit-reward" />
      </StepperContainer>
      {depositRewardApproveData && isSuccessDepositRewardApprove && (
        <TxInfoBar
          description={t`Reward approved`}
          txHash={networks[chainId].scanTxPath(depositRewardApproveData[0])}
        />
      )}
      {depositRewardData && isSuccessDepositReward && (
        <TxInfoBar description={t`Reward deposited`} txHash={networks[chainId].scanTxPath(depositRewardData)} />
      )}
    </>
  )
}
