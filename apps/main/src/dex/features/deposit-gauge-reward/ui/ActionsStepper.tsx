import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useGaugeDepositRewardIsApproved } from '@/dex/entities/gauge'
import type { DepositRewardApproveMutation, DepositRewardMutation } from '@/dex/entities/gauge/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { DepositRewardFormValues, DepositRewardStep } from '@/dex/features/deposit-gauge-reward/types'
import { ChainId } from '@/dex/types/main.types'
import { useFormContext } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { REFRESH_INTERVAL } from '@evm-ui/utils'
import { getStepStatus } from '@legacy-ui/Stepper/helpers'
import { Stepper } from '@legacy-ui/Stepper/Stepper'
import type { Step } from '@legacy-ui/Stepper/types'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'
import Stack from '@mui/material/Stack'
import type { UseMutateFunction } from '@tanstack/react-query'

const { Spacing } = SizesAndSpaces

type TxInfo = {
  description: string
  txHash: string | undefined
}

export const DepositStepper = ({
  chainId,
  poolId,
  depositRewardApprove,
  depositReward,
  isPendingDepositRewardApprove,
  isPendingDepositReward,
}: {
  chainId: ChainId
  poolId: string
  depositRewardApprove: UseMutateFunction<string[], Error, DepositRewardApproveMutation>
  depositReward: UseMutateFunction<string, Error, DepositRewardMutation>
  isPendingDepositRewardApprove: boolean
  isPendingDepositReward: boolean
}) => {
  const {
    formState: { isValid, isSubmitting },
    watchValues,
    update: updateForm,
    getValue,
    setError,
    handleSubmit,
  } = useFormContext<DepositRewardFormValues>()
  const { data: network } = useNetworkByChain({ chainId })

  const { amount, rewardTokenId, step, userBalance } = watchValues()

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
        onClick: () => void handleSubmit(onSubmitApproval)(),
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
        onClick: () => void handleSubmit(onSubmitDeposit)(),
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
      <Stack sx={{ gap: Spacing.md }}>
        <Stepper steps={steps} testId="deposit-reward" />
      </Stack>
      {latestTxInfo && <TxInfoBar description={latestTxInfo.description} txHash={latestTxInfo.txHash} />}
    </>
  )
}
