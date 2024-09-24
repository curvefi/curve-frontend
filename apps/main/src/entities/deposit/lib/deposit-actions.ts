import type { ApproveDeposit, Deposit, Stake } from '@/entities/deposit/types'
import type { TxHashError } from '@/ui/TxInfoBar'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'

import { t } from '@lingui/macro'
import { useMutation } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { amountsDescription, tokensDescription } from '@/components/PagePool/utils'
import { queryClient } from '@/shared/api/query-client'
import useStore from '@/store/useStore'
import * as api from '@/entities/deposit/api'
import * as conditions from '@/entities/deposit/model/deposit-mutation-conditions'

const autoDismissMs = REFRESH_INTERVAL['5s']

export const useApproveDeposit = (params: ApproveDeposit) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, ApproveDeposit>({
    mutationFn: api.mutateApproveDeposit,
    onMutate: ({ amounts }) => {
      const notifyMessage = t`Please approve spending ${tokensDescription(amounts)}.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (_, { amounts }) => {
      const notifyMessage = t`Successfully approved spending ${tokensDescription(amounts)}`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['depositEstGasApproval'] })
    },
    onError: (_, { amounts }) => {
      const notifyMessage = t`Failed to approve spending ${tokensDescription(amounts)}.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.approveDepositValidity(params) }
}

export const useDeposit = (params: Deposit) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Deposit>({
    mutationFn: api.mutateDeposit,
    onMutate: ({ amounts, formType, maxSlippage }) => {
      const notifyMessage =
        formType === 'DEPOSIT'
          ? t`Please confirm deposit ${amountsDescription(amounts)} at max slippage ${maxSlippage}%.`
          : t`Please confirm deposit & stake ${amountsDescription(amounts)} at max slippage ${maxSlippage}%.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (resp, { amounts, formType }) => {
      const notifyMessage =
        formType === 'DEPOSIT'
          ? t`Successfully deposited ${amountsDescription(amounts)}.`
          : t`Successfully deposited and staked ${amountsDescription(amounts)}.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['signerPoolBalances'] })
      queryClient.invalidateQueries({ queryKey: ['poolCurrencyReserves'] })
    },
    onError: (error, { amounts, formType }) => {
      const notifyMessage =
        formType === 'DEPOSIT'
          ? t`Failed to deposit ${amountsDescription(amounts)}.`
          : t`Failed to deposit and stake ${amountsDescription(amounts)}.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.depositValidity(params) }
}

export const useApproveStake = (params: Stake) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Stake>({
    mutationFn: api.mutateApproveStake,
    onMutate: () => {
      const notifyMessage = t`Please approve spending LP tokens.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: () => {
      const notifyMessage = t`Successfully approved spending LP tokens.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['stakeEstGasApproval'] })
    },
    onError: () => {
      const notifyMessage = t`Failed to approve spending LP tokens.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.approveStake(params) }
}

export const useStake = (params: Stake) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Stake>({
    mutationFn: api.mutateStake,
    onMutate: ({ lpToken }) => {
      const notifyMessage = t`Please confirm staking your ${lpToken} LP tokens.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (_, { lpToken }) => {
      const notifyMessage = t`Successfully staked ${lpToken} LP tokens.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['signerPoolBalances'] })
    },
    onError: (_, { lpToken }) => {
      const notifyMessage = t`Failed to stake ${lpToken} LP tokens.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.stake(params) }
}
