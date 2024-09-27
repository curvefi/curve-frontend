import type { Stake } from '@/entities/stake'
import type { TxHashError } from '@/ui/TxInfoBar'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'

import { t } from '@lingui/macro'
import { useMutation } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { queryClient } from '@/shared/api/query-client'
import useStore from '@/store/useStore'
import * as api from '@/entities/stake/api'
import * as conditions from '@/entities/stake/model/stake-mutation-conditions'

const autoDismissMs = REFRESH_INTERVAL['5s']

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
