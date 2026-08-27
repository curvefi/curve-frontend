import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { formatToken, waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { fetchCreateLockIsApproved } from '../queries/create-lock-approved.query'
import type { CreateLockMutation } from '../queries/create-lock.types'
import { createLockFormValidationSuite } from '../queries/create-lock.validation'

export const useCreateLockMutation = ({
  chainId,
  userAddress,
  onCreated,
}: {
  chainId: number
  userAddress: Address | undefined
  onCreated: OnTransactionSuccess<CreateLockMutation>
}) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<CreateLockMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.create'] as const,
    mutationFn: async ({ lockedAmt, days }) => {
      const params = { chainId, userAddress, lockedAmt, days }
      await waitForApproval({
        isApproved: async () => await fetchCreateLockIsApproved(params, { staleTime: 0 }),
        onApprove: async () => (await requireLib('curveApi').boosting.approve(lockedAmt)) as Hex[],
        message: t`Approved lock creation`,
        config,
      })
      return { hash: (await requireLib('curveApi').boosting.createLock(lockedAmt, days)) as Hex }
    },
    validationSuite: createLockFormValidationSuite,
    validationParams: {},
    pendingMessage: ({ lockedAmt }) => t`Creating lock for ${formatToken(lockedAmt, 'CRV', 'amount')}...`,
    successMessage: () => t`CRV locked successfully`,
    onSuccess: onCreated,
    onReset: () => undefined,
  })
  return { onSubmit: useCallback((values: CreateLockMutation) => mutate(values), [mutate]), error, isPending }
}
