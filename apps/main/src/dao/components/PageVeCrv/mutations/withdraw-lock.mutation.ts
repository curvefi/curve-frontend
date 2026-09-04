import { useCallback } from 'react'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui/lib/i18n'
import type { WithdrawLockMutation } from '../queries/withdraw-lock.types'
import { withdrawLockValidationSuite } from '../queries/withdraw-lock.validation'

export const useWithdrawLockMutation = ({
  chainId,
  userAddress,
  lockedAmount,
  unlockTime,
  onReset,
  onWithdrawn,
}: {
  chainId: number
  userAddress: Address | undefined
  lockedAmount: Decimal | undefined
  unlockTime: number | undefined
  onReset: () => void
  onWithdrawn: OnTransactionSuccess<WithdrawLockMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<WithdrawLockMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.withdraw'] as const,
    mutationFn: async () => ({ hash: (await requireLib('curveApi').boosting.withdrawLockedCrv()) as Hex }),
    validationSuite: withdrawLockValidationSuite,
    validationParams: { chainId, lockedAmount, unlockTime },
    pendingMessage: () => t`Withdrawing locked CRV...`,
    successMessage: () => t`CRV withdrawal successful.`,
    onSuccess: onWithdrawn,
    onReset,
  })
  return { onSubmit: useCallback(() => mutate({}), [mutate]), error, isPending }
}
