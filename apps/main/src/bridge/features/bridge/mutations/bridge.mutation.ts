import { useCallback } from 'react'
import type { Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatTokenAmount } from '@ui-kit/utils'
import type { BridgeForm } from '../hooks/useBridgeForm'
import { fetchBridgeCost } from '../queries/bridge-cost.query'
import { bridgeFormValidationSuite } from '../validation/bridge.validation'

type BridgeMutation = {
  amount: Decimal
}

type BridgeOptions = {
  chainId: number
  onReset: () => void
}

export const useBridgeMutation = ({ chainId, ...props }: BridgeOptions) => {
  const { mutate, error, isPending } = useTransactionMutation<BridgeMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'bridge'] as const,
    mutationFn: async ({ amount }) => {
      const curve = requireLib('curveApi')
      await fetchBridgeCost({ chainId }) // Must be called before bridging to cache the value
      return await curve.fastBridge.bridge(amount).then(({ hash }) => ({ hash: hash as Hex }))
    },
    validationSuite: bridgeFormValidationSuite,
    validationParams: { chainId },
    pendingMessage: mutation => t`Bridging... ${formatTokenAmount(mutation.amount, 'crvUSD')}`,
    successMessage: mutation => t`Bridged! ${formatTokenAmount(mutation.amount, 'crvUSD')}`,
    ...props,
  })

  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  const onSubmit = useCallback(async (form: BridgeForm) => mutate(form as BridgeMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
