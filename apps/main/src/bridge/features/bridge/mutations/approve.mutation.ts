import { useCallback } from 'react'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { type OnTransactionSuccess, useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import type { Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import type { BridgeForm } from '../hooks/useBridgeForm'
import { bridgeFormValidationSuite } from '../validation/bridge.validation'

type BridgeApproveMutation = { amount: Decimal }

type BridgeApproveOptions = {
  chainId: number
  onApproved: OnTransactionSuccess<BridgeApproveMutation>
  onReset: () => void
}

export const useBridgeApproveMutation = ({ chainId, onApproved, ...props }: BridgeApproveOptions) => {
  const { mutate, error, isPending } = useEvmMutation<BridgeApproveMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'bridge-approve'] as const,
    mutationFn: async ({ amount }) =>
      await requireLib('curveApi')
        .fastBridge.approve(amount)
        .then(([hash]) => ({ hash: hash as Hex })),
    validationSuite: bridgeFormValidationSuite,
    validationParams: { chainId },
    pendingMessage: mutation => t`Approving... ${formatToken(mutation.amount, 'crvUSD', 'amount')}`,
    successMessage: mutation => t`Approved! ${formatToken(mutation.amount, 'crvUSD', 'amount')}`,
    onSuccess: onApproved,
    ...props,
  })

  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  const onSubmit = useCallback(async (form: BridgeForm) => mutate(form as BridgeApproveMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
