import type { ApproveSwap, Swap } from '@/entities/swap'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'
import type { TxHashError } from '@/ui/TxInfoBar'

import { useMutation } from '@tanstack/react-query'
import { t } from '@lingui/macro'

import { REFRESH_INTERVAL } from '@/constants'
import { queryClient } from '@/shared/api/query-client'
import useStore from '@/store/useStore'
import * as api from '@/entities/swap/api'
import * as conditions from '@/entities/swap/model/swap-mutation-conditions'

const autoDismissMs = REFRESH_INTERVAL['5s']

export const useApproveSwap = (params: ApproveSwap) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, ApproveSwap>({
    mutationFn: api.mutateSwapApprove,
    onMutate: ({ fromToken }) => {
      const notifyMessage = t`Please approve spending ${fromToken}.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (_, { fromToken }) => {
      const notifyMessage = t`Successfully approved spending ${fromToken}.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['swapEstGasApproval'] })
    },
    onError: (_, { fromToken }) => {
      const notifyMessage = t`Failed to approve spending ${fromToken}.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.enableApproveSwap(params) }
}

export const useSwap = (params: Swap) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Swap>({
    mutationFn: api.mutateSwap,
    onMutate: ({ fromAmount, fromToken, toAmount, toToken, maxSlippage }) => {
      const notifyMessage = t`Please confirm swapping ${fromAmount} ${fromToken} to ${toAmount} ${toToken} at ${maxSlippage}%.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (_, { fromAmount, fromToken, toAmount, toToken }) => {
      const notifyMessage = t`Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} ${toToken}.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['signerPoolBalances'] })
    },
    onError: (_, { fromAmount, fromToken, toAmount, toToken }) => {
      const notifyMessage = t`Failed to swap ${fromAmount} ${fromToken} to ${toAmount} ${toToken}.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.enableSwap(params) }
}
