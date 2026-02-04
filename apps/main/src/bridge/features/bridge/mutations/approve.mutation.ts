import { useCallback } from 'react'
import type { Hex } from 'viem'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { useTransactionMutation, type OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatNumber, type Decimal } from '@ui-kit/utils'
import type { BridgeForm } from '../hooks/useBridgeForm'
import { bridgeFormValidationSuite } from '../validation/bridge.validation'

type BridgeApproveMutation = {
  amount: Decimal
}

export type BridgeApproveOptions = {
  chainId: number
  onApproved?: OnTransactionSuccess<BridgeApproveMutation>
}

export const useBridgeApproveMutation = ({ chainId, onApproved }: BridgeApproveOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useTransactionMutation<BridgeApproveMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'bridge-approve'] as const,
    mutationFn: async ({ amount }) =>
      await requireLib('curveApi')
        .fastBridge.approve(amount)
        .then((hashes) => ({ hash: hashes[0] as Hex })),
    validationSuite: bridgeFormValidationSuite,
    validationParams: { chainId },
    pendingMessage: (mutation) => t`Approving... ${formatNumber(mutation.amount, { abbreviate: false })} crvUSD`,
    successMessage: (mutation) => t`Approved! ${formatNumber(mutation.amount, { abbreviate: false })} crvUSD`,
    onSuccess: onApproved,
  })

  const onSubmit = useCallback(async (form: BridgeForm) => mutate(form as BridgeApproveMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
