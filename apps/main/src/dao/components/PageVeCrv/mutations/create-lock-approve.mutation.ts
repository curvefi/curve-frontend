import { useCallback } from 'react'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { formatToken } from '@evm-ui/utils'
import type { Hex } from '@primitives/address.utils'
import type { CreateLockApproveMutation } from '../queries/create-lock.types'
import { createLockApproveValidationSuite } from '../queries/create-lock.validation'

export const useCreateLockApproveMutation = ({
  chainId,
  onApproved,
}: {
  chainId: number
  onApproved: OnTransactionSuccess<CreateLockApproveMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<CreateLockApproveMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'lockCrv.approve'] as const,
    mutationFn: async ({ lockedAmt }) => {
      const [hash] = await requireLib('curveApi').boosting.approve(lockedAmt)
      return { hash: hash as Hex }
    },
    validationSuite: createLockApproveValidationSuite,
    validationParams: {},
    pendingMessage: ({ lockedAmt }) => t`Please approve spending ${formatToken(lockedAmt, 'CRV', 'amount')}.`,
    successMessage: () => t`Spending approved`,
    onSuccess: onApproved,
    onReset: () => undefined,
  })
  return { onSubmit: useCallback((values: CreateLockApproveMutation) => mutate(values), [mutate]), error, isPending }
}
