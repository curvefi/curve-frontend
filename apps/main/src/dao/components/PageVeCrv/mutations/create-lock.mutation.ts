import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { formatToken, waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'
import { fetchCreateLockIsApproved } from '../queries/create-lock-approved.query'
import type { CreateLockFormValues, CreateLockMutation } from '../queries/create-lock.types'
import { createLockQueryValidationSuite } from '../queries/create-lock.validation'

export const useCreateLockMutation = ({
  chainId,
  userAddress,
  onReset,
  onCreated,
}: {
  chainId: number
  userAddress: Address | undefined
  onReset: () => void
  onCreated: OnTransactionSuccess<CreateLockMutation>
}) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<CreateLockMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.create'] as const,
    mutationFn: async ({ lockedAmount, days }) => {
      const params = { chainId, userAddress, lockedAmount, days }
      const curveApi = requireLib('curveApi')
      await waitForApproval({
        isApproved: () => fetchCreateLockIsApproved(params, { staleTime: 0 }),
        onApprove: async () => (await curveApi.boosting.approve(lockedAmount)) as Hex[],
        message: t`Approved lock creation`,
        config,
      })
      return { hash: (await curveApi.boosting.createLock(lockedAmount, days)) as Hex }
    },
    validationSuite: createLockQueryValidationSuite,
    validationParams: { chainId },
    pendingMessage: ({ lockedAmount }) => t`Creating lock for ${formatToken(lockedAmount, 'CRV', 'amount')}...`,
    successMessage: () => t`CRV locked successfully`,
    onSuccess: onCreated,
    onReset,
  })
  const onSubmit = useCallback((values: CreateLockFormValues) => mutate(values as CreateLockMutation), [mutate])
  return { onSubmit, error, isPending }
}
