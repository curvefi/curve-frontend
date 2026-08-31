import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { formatToken, waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { fetchIncreaseLockIsApproved } from '../queries/increase-lock-approved.query'
import type { IncreaseLockMutation } from '../queries/increase-lock.types'
import { increaseLockQueryValidationSuite } from '../queries/increase-lock.validation'

export const useIncreaseLockMutation = ({
  chainId,
  userAddress,
  onReset,
  onIncreased,
}: {
  chainId: number
  userAddress: Address | undefined
  onReset: () => void
  onIncreased: OnTransactionSuccess<IncreaseLockMutation>
}) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<IncreaseLockMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.increase'] as const,
    mutationFn: async ({ lockedAmount }) => {
      const params = { chainId, userAddress, lockedAmount }
      const curveApi = requireLib('curveApi')
      await waitForApproval({
        isApproved: () => fetchIncreaseLockIsApproved(params, { staleTime: 0 }),
        onApprove: async () => (await curveApi.boosting.approve(lockedAmount)) as Hex[],
        message: t`Approved lock increase`,
        config,
      })
      return { hash: (await curveApi.boosting.increaseAmount(lockedAmount)) as Hex }
    },
    validationSuite: increaseLockQueryValidationSuite,
    validationParams: { chainId },
    pendingMessage: ({ lockedAmount }) => t`Increasing lock amount by ${formatToken(lockedAmount, 'CRV', 'amount')}...`,
    successMessage: () => t`Lock amount updated`,
    onSuccess: onIncreased,
    onReset,
  })
  return { onSubmit: useCallback((values: IncreaseLockMutation) => mutate(values), [mutate]), error, isPending }
}
