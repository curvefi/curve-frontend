import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
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
import { useFormContext } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

type TxInfo = {
  description: string
  txHash: string | undefined
}

export const DepositStepper = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const {
    formState: { isValid, isSubmitting },
    watchValue,
    update: updateForm,
    getValue,
    setError,
    handleSubmit,
  } = useFormContext<DepositRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })

  const amount = watchValue('amount')
  const rewardTokenId = watchValue('rewardTokenId')
  const step = watchValue('step')
  const userBalance = watchValue('userBalance')

  const { mutate: depositRewardApprove, isPending: isPendingDepositRewardApprove } = useDepositRewardApprove({
    chainId,
    poolId,
  })

  const { mutate: depositReward, isPending: isPendingDepositReward } = useDepositReward({ chainId, poolId })

  const [latestTxInfo, setLatestTxInfo] = useState<TxInfo | null>(null)

  const onSubmitApproval = useCallback(() => {
    const onApproveSuccess = (data: string[]) => {
      updateForm({ step: DepositRewardStep.DEPOSIT }, { automated: true })
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
        rewardTokenId: getValue('rewardTokenId'),
        amount: getValue('amount'),
        userBalance: getValue('userBalance'),
      },
      { onSuccess: onApproveSuccess, onError: onApproveError },
    )
  }, [depositRewardApprove, getValue, network, setError, updateForm])

  const onSubmitDeposit = useCallback(() => {
    depositReward(
      {
        rewardTokenId: getValue('rewardTokenId'),
        amount: getValue('amount'),
        epoch: getValue('epoch'),
        userBalance: getValue('userBalance'),
      },
      {
        onSuccess: (data: string) => {
          updateForm({ step: DepositRewardStep.CONFIRMATION }, { automated: true })
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
  }, [depositReward, getValue, network, setError, updateForm])

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
        updateForm({ step: DepositRewardStep.APPROVAL }, { automated: true })
      }, REFRESH_INTERVAL['2s'])
      return () => clearTimeout(timer)
    }
    if (isDepositRewardApproved) {
      updateForm({ step: DepositRewardStep.DEPOSIT }, { automated: true })
      return
    }
    if (isLoadingDepositRewardApproved) {
      updateForm({ step: DepositRewardStep.APPROVAL }, { automated: true })
      return
    }
    if (isValid && !isLoadingDepositRewardApproved && !isDepositRewardApproved) {
      updateForm({ step: DepositRewardStep.APPROVAL }, { automated: true })
      return
    }
  }, [isDepositRewardApproved, isLoadingDepositRewardApproved, isValid, step, updateForm])

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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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
