import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { formatToken, waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import type { IncreaseLockMutation } from '../queries/increase-lock.types'
import { fetchIncreaseLockIsApproved } from '../queries/increase-lock-approved.query'
import { increaseLockFormValidationSuite } from '../queries/increase-lock.validation'

export const useIncreaseLockMutation = ({
  chainId,
  userAddress,
  onIncreased,
}: {
  chainId: number
  userAddress: Address | undefined
  onIncreased: OnTransactionSuccess<IncreaseLockMutation>
}) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<IncreaseLockMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.increase'] as const,
    mutationFn: async ({ lockedAmt }) => {
      const params = { chainId, userAddress, lockedAmt }
      await waitForApproval({
        isApproved: async () => await fetchIncreaseLockIsApproved(params, { staleTime: 0 }),
        onApprove: async () => (await requireLib('curveApi').boosting.approve(lockedAmt)) as Hex[],
        message: t`Approved lock increase`,
        config,
      })
      return { hash: (await requireLib('curveApi').boosting.increaseAmount(lockedAmt)) as Hex }
    },
    validationSuite: increaseLockFormValidationSuite,
    validationParams: {},
    pendingMessage: ({ lockedAmt }) => t`Increasing lock amount by ${formatToken(lockedAmt, 'CRV', 'amount')}...`,
    successMessage: () => t`Lock amount updated`,
    onSuccess: onIncreased,
    onReset: () => undefined,
  })
  return { onSubmit: useCallback((values: IncreaseLockMutation) => mutate(values), [mutate]), error, isPending }
}
