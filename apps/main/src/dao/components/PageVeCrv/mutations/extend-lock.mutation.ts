import { useCallback } from 'react'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import type { Hex } from '@primitives/address.utils'
import type { ExtendLockMutation } from '../queries/extend-lock.types'
import { extendLockFormValidationSuite } from '../queries/extend-lock.validation'

export const useExtendLockMutation = ({
  chainId,
  onExtended,
}: {
  chainId: number
  onExtended: OnTransactionSuccess<ExtendLockMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<ExtendLockMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'lockCrv.extend'] as const,
    mutationFn: async ({ days }) => ({ hash: (await requireLib('curveApi').boosting.increaseUnlockTime(days)) as Hex }),
    validationSuite: extendLockFormValidationSuite,
    validationParams: {},
    pendingMessage: () => t`Extending lock...`,
    successMessage: () => t`Lock date updated`,
    onSuccess: onExtended,
    onReset: () => undefined,
  })
  return { onSubmit: useCallback((values: ExtendLockMutation) => mutate(values), [mutate]), error, isPending }
}
