import { t } from '@lingui/macro'
import { FunctionComponent, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { DepositRewardFormValues, DepositRewardStep } from '@/features/deposit-gauge-reward/types'
import { StepperContainer } from '@/features/deposit-gauge-reward/ui'
import { useDepositReward, useDepositRewardApprove, useGaugeDepositRewardIsApproved } from '@/entities/gauge'
import { REFRESH_INTERVAL } from '@/constants'
import useStore from '@/store/useStore'
import Stepper from '@/ui/Stepper'
import { getStepStatus } from '@/ui/Stepper/helpers'
import type { Step } from '@/ui/Stepper/types'
import TxInfoBar from '@/ui/TxInfoBar'

type TxInfo = {
  description: string
  txHash: string
}

export const DepositStepper: FunctionComponent<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const {
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    getValues,
    setError,
    handleSubmit,
  } = useFormContext<DepositRewardFormValues>()
  const { scanTxPath } = useStore((state) => state.networks.networks[chainId])

  const amount = watch('amount')
  const rewardTokenId = watch('rewardTokenId')
  const step = watch('step')

  const { mutate: depositRewardApprove, isPending: isPendingDepositRewardApprove } = useDepositRewardApprove({
    chainId,
    poolId,
  })

  const { mutate: depositReward, isPending: isPendingDepositReward } = useDepositReward({ chainId, poolId })

  const [latestTxInfo, setLatestTxInfo] = useState<TxInfo | null>(null)

  const onSubmitApproval = useCallback(() => {
    const onApproveSuccess = (data: string[]) => {
      setValue('step', DepositRewardStep.DEPOSIT, { shouldValidate: true })
      setLatestTxInfo({
        description: t`Reward approved`,
        txHash: scanTxPath(data[0]),
      })
    }

    const onApproveError = (error: Error) => {
      setError('root.serverError', { message: error.message })
    }

    depositRewardApprove(
      {
        rewardTokenId: getValues('rewardTokenId'),
        amount: getValues('amount'),
      },
      { onSuccess: onApproveSuccess, onError: onApproveError },
    )
  }, [depositRewardApprove, getValues, setError, setValue, scanTxPath])

  const onSubmitDeposit = useCallback(() => {
    depositReward(
      {
        rewardTokenId: getValues('rewardTokenId'),
        amount: getValues('amount'),
        epoch: getValues('epoch'),
      },
      {
        onSuccess: (data: string) => {
          setValue('step', DepositRewardStep.CONFIRMATION)
          setLatestTxInfo({
            description: t`Reward deposited`,
            txHash: scanTxPath(data),
          })
        },
        onError: (error: Error) => {
          setError('root.serverError', { message: error.message })
        },
      },
    )
  }, [depositReward, getValues, setError, setValue, scanTxPath])

  const { data: isDepositRewardApproved, isLoading: isLoadingDepositRewardApproved } = useGaugeDepositRewardIsApproved({
    chainId,
    poolId,
    rewardTokenId,
    amount,
  })

  useLayoutEffect(() => {
    if (step === DepositRewardStep.CONFIRMATION) {
      const timer = setTimeout(() => {
        setValue('step', DepositRewardStep.APPROVAL, { shouldValidate: true })
      }, REFRESH_INTERVAL['2s'])
      return () => clearTimeout(timer)
    }
    if (isDepositRewardApproved) {
      setValue('step', DepositRewardStep.DEPOSIT, { shouldValidate: true })
      return
    }
    if (isLoadingDepositRewardApproved) {
      setValue('step', DepositRewardStep.APPROVAL, { shouldValidate: true })
      return
    }
    if (isValid && !isLoadingDepositRewardApproved && !isDepositRewardApproved) {
      setValue('step', DepositRewardStep.APPROVAL, { shouldValidate: true })
      return
    }
  }, [isDepositRewardApproved, isLoadingDepositRewardApproved, setValue, isValid, isSubmitting, step])

  const steps = useMemo<Step[]>(
    () => [
      {
        key: 'APPROVAL',
        status: getStepStatus(
          [DepositRewardStep.CONFIRMATION, DepositRewardStep.DEPOSIT].includes(step),
          step === DepositRewardStep.APPROVAL && (isSubmitting || isPendingDepositRewardApprove),
          isValid && !isSubmitting,
        ),
        type: 'action',
        content:
          [DepositRewardStep.CONFIRMATION, DepositRewardStep.DEPOSIT].includes(step) ||
          (!isLoadingDepositRewardApproved && isDepositRewardApproved)
            ? t`Spending Approved`
            : t`Approve Spending`,
        onClick: handleSubmit(onSubmitApproval),
      },
      {
        key: 'DEPOSIT',
        status: getStepStatus(
          step === DepositRewardStep.CONFIRMATION,
          step === DepositRewardStep.DEPOSIT && isPendingDepositReward,
          isValid && !isPendingDepositReward && !!isDepositRewardApproved,
        ),
        type: 'action',
        content: step === DepositRewardStep.CONFIRMATION ? t`Deposited` : t`Deposit`,
        onClick: handleSubmit(onSubmitDeposit),
      },
    ],
    [
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
    ],
  )

  return (
    <>
      <StepperContainer>
        <Stepper steps={steps} testId="deposit-reward" />
      </StepperContainer>
      {latestTxInfo && <TxInfoBar description={latestTxInfo.description} txHash={latestTxInfo.txHash} />}
    </>
  )
}
