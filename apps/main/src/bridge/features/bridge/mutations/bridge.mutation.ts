import { useCallback } from 'react'
import type { Hex } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { useTransactionMutation, type OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatNumber } from '@ui-kit/utils'
import type { BridgeForm } from '../hooks/useBridgeForm'
import { fetchBridgeCost } from '../queries/bridge-cost.query'
import { bridgeFormValidationSuite } from '../validation/bridge.validation'

type BridgeMutation = {
  amount: Decimal
}

export type BridgeOptions = {
  chainId: number
  onBridged?: OnTransactionSuccess<BridgeMutation>
  onReset?: () => void
}

export const useBridgeMutation = ({ chainId, onBridged, onReset }: BridgeOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useTransactionMutation<BridgeMutation>({
    mutationKey: [...rootKeys.chain({ chainId }), 'bridge'] as const,
    mutationFn: async ({ amount }) => {
      const curve = requireLib('curveApi')
      await fetchBridgeCost({ chainId }) // Must be called before bridging to cache the value
      return await curve.fastBridge.bridge(amount).then(({ hash }) => ({ hash: hash as Hex }))
    },
    validationSuite: bridgeFormValidationSuite,
    validationParams: { chainId },
    pendingMessage: (mutation) => t`Bridging... ${formatNumber(mutation.amount, { abbreviate: false })} crvUSD`,
    successMessage: (mutation) => t`Bridged! ${formatNumber(mutation.amount, { abbreviate: false })} crvUSD`,
    onSuccess: onBridged,
    onReset,
  })

  const onSubmit = useCallback(async (form: BridgeForm) => mutate(form as BridgeMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
