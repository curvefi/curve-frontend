import type { TxHashError } from '@/ui/TxInfoBar'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'
import type { ClaimableDetailsResp, ApproveWithdraw, Withdraw, Unstake, Claim } from '@/entities/withdraw'

import { t } from '@lingui/macro'
import { useMutation } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { queryClient } from '@/shared/api/query-client'
import useStore from '@/store/useStore'
import * as api from '@/entities/withdraw/api/withdraw-mutation'
import * as conditions from '@/entities/withdraw/model/withdraw-mutation-conditions'

const autoDismissMs = REFRESH_INTERVAL['5s']

export const useApproveWithdraw = (params: ApproveWithdraw) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, ApproveWithdraw>({
    mutationFn: api.mutationApproveWithdraw,
    onMutate: () => {
      let notifyMessage = t`Please approve spending LP tokens.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: () => {
      const notifyMessage = t`Successfully approved spending LP tokens.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['withdrawEstGasApproval'] })
    },
    onError: () => {
      const notifyMessage = t`Failed to spend LP tokens.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.enableApproveWithdraw(params) }
}

export const useWithdraw = (params: Withdraw) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Withdraw>({
    mutationFn: api.mutationWithdraw,
    onMutate: ({ lpToken, maxSlippage }) => {
      const notifyMessage = t`Please confirm withdrawing ${lpToken} LP tokens at max slippage ${maxSlippage}%.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (resp, { lpToken }) => {
      const notifyMessage = t`Successfully withdraw ${lpToken} LP tokens.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['signerPoolBalances'] })
    },
    onError: (_, { lpToken }) => {
      const notifyMessage = t`Failed to withdrew ${lpToken} LP tokens.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.enableWithdraw(params) }
}

export const useUnstake = (params: Unstake) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Unstake>({
    mutationFn: api.mutationUnstake,
    onMutate: ({ gauge }) => {
      const notifyMessage = t`Please confirm unstake ${gauge} LP tokens.`
      notifyNotification(notifyMessage, 'pending', REFRESH_INTERVAL['3s'])
    },
    onSuccess: (_, { gauge }) => {
      const notifyMessage = t`Successfully unstaked ${gauge} LP tokens.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['signerPoolBalances'] })
    },
    onError: (_, { gauge }) => {
      const notifyMessage = t`Failed to unstake ${gauge} LP tokens.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.enableUnstake(params) }
}

export const useClaim = (params: Claim) => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  const mutation = useMutation<WaitForTxReceiptResp, TxHashError, Claim>({
    mutationFn: api.mutationClaim,
    onMutate: ({ claimType, claimableCrv, claimableRewards }) => {
      const notifyMessage =
        claimType === 'CLAIM_CRV'
          ? t`Please confirm claiming ${claimableCrv} CRV.`
          : t`Please confirm claiming ${getClaimableRewardsTokens(claimableRewards)}.`
      notifyNotification(notifyMessage, 'pending', autoDismissMs)
    },
    onSuccess: (_, { claimType, claimableCrv, claimableRewards }) => {
      const notifyMessage =
        claimType === 'CLAIM_CRV'
          ? t`Successfully claimed ${claimableCrv} CRV.`
          : t`Successfully claimed ${getClaimableRewardsTokens(claimableRewards)}.`
      notifyNotification(notifyMessage, 'success', autoDismissMs)
      queryClient.invalidateQueries({ queryKey: ['signerPoolBalances'] })
      queryClient.invalidateQueries({ queryKey: ['claimableDetails'] })
    },
    onError: (_, { claimType, claimableCrv, claimableRewards }) => {
      const notifyMessage =
        claimType === 'CLAIM_CRV'
          ? t`Failed to claim ${claimableCrv} CRV.`
          : t`Failed to claim ${getClaimableRewardsTokens(claimableRewards)}.`
      notifyNotification(notifyMessage, 'error', autoDismissMs)
    },
  })

  return { mutation, enabled: conditions.enableClaim(params) }
}

// helpers
function getClaimableRewardsTokens(claimableRewards: ClaimableDetailsResp['claimableRewards']) {
  return claimableRewards.map((r) => `${r.amount} ${r.symbol}`).join(', ')
}
