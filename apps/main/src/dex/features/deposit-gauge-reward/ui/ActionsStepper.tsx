import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDepositReward, useDepositRewardApprove, useGaugeDepositRewardIsApproved } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { DepositRewardFormValues, DepositRewardStep } from '@/dex/features/deposit-gauge-reward/types'
import { StepperContainer } from '@/dex/features/deposit-gauge-reward/ui'
import { ChainId } from '@/dex/types/main.types'
import { getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

type TxInfo = {
  description: string
  txHash: string | undefined
}

export const DepositStepper = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const {
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    getValues,
    setError,
    handleSubmit,
  } = useFormContext<DepositRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })

  const amount = watch('amount')
  const rewardTokenId = watch('rewardTokenId')
  const step = watch('step')
  const userBalance = watch('userBalance')

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
        txHash: scanTxPath(network, data[0]),
      })
    }

    const onApproveError = (error: Error) => {
      setError('root.serverError', { message: error.message })
    }

    depositRewardApprove(
      {
        rewardTokenId: getValues('rewardTokenId'),
        amount: getValues('amount'),
        userBalance: getValues('userBalance'),
      },
      { onSuccess: onApproveSuccess, onError: onApproveError },
    )
  }, [depositRewardApprove, getValues, setError, setValue, network])

  const onSubmitDeposit = useCallback(() => {
    depositReward(
      {
        rewardTokenId: getValues('rewardTokenId'),
        amount: getValues('amount'),
        epoch: getValues('epoch'),
        userBalance: getValues('userBalance'),
      },
      {
        onSuccess: (data: string) => {
          setValue('step', DepositRewardStep.CONFIRMATION)
          setLatestTxInfo({
            description: t`Reward deposited`,
            txHash: scanTxPath(network, data),
          })
        },
        onError: (error: Error) => {
          setError('root.serverError', { message: error.message })
        },
      },
    )
  }, [depositReward, getValues, setError, setValue, network])

  const { data: isDepositRewardApproved, isLoading: isLoadingDepositRewardApproved } = useGaugeDepositRewardIsApproved({
    chainId,
    poolId,
    rewardTokenId,
    amount,
    userBalance,
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
