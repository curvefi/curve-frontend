import { useCallback } from 'react'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import type { Hex } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'
import type { ExtendLockMutation } from '../queries/extend-lock.types'
import { extendLockQueryValidationSuite } from '../queries/extend-lock.validation'

export const useExtendLockMutation = ({
  chainId,
  onReset,
  onExtended,
}: {
  chainId: number
  onReset: () => void
  onExtended: OnTransactionSuccess<ExtendLockMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<ExtendLockMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'lockCrv.extend'] as const,
    mutationFn: async ({ days }) => ({ hash: (await requireLib('curveApi').boosting.increaseUnlockTime(days)) as Hex }),
    validationSuite: extendLockQueryValidationSuite,
    validationParams: { chainId },
    pendingMessage: () => t`Extending lock...`,
    successMessage: () => t`Lock date updated`,
    onSuccess: onExtended,
    onReset,
  })
  return { onSubmit: useCallback((values: ExtendLockMutation) => mutate(values), [mutate]), error, isPending }
}
