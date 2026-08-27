import { useCallback } from 'react'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { formatToken } from '@evm-ui/utils'
import type { Hex } from '@primitives/address.utils'
import type { CreateLockMutation } from '../queries/create-lock.types'
import { createLockFormValidationSuite } from '../queries/create-lock.validation'

export const useCreateLockMutation = ({
  chainId,
  onCreated,
}: {
  chainId: number
  onCreated: OnTransactionSuccess<CreateLockMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<CreateLockMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'lockCrv.create'] as const,
    mutationFn: async ({ lockedAmt, days }) => ({
      hash: (await requireLib('curveApi').boosting.createLock(lockedAmt, days)) as Hex,
    }),
    validationSuite: createLockFormValidationSuite,
    validationParams: {},
    pendingMessage: ({ lockedAmt }) => t`Creating lock for ${formatToken(lockedAmt, 'CRV', 'amount')}...`,
    successMessage: () => t`CRV locked successfully`,
    onSuccess: onCreated,
    onReset: () => undefined,
  })
  return { onSubmit: useCallback((values: CreateLockMutation) => mutate(values), [mutate]), error, isPending }
}
