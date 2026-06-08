import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import type { ChainId } from '@/loan/types/loan.types'
import type { Address, Hex } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatNumber } from '@ui-kit/utils'
import { invalidateScrvUsdMutationQueries } from './scrvusd-mutation.helpers'
import type { ScrvUsdWithdrawForm, ScrvUsdWithdrawMutation } from './scrvusd.validation'
import { scrvUsdWithdrawMaxValidationSuite } from './scrvusd.validation'

type ScrvUsdWithdrawOptions = {
  chainId: ChainId
  userAddress: Address | undefined
  onReset: () => void
  onSuccess?: OnTransactionSuccess<ScrvUsdWithdrawMutation>
}

export const useScrvUsdWithdrawMutation = ({ chainId, userAddress, onSuccess, ...props }: ScrvUsdWithdrawOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<ScrvUsdWithdrawMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.withdraw'] as const,
    mutationFn: async ({ withdrawAmount, isFull, userVaultShares }) => {
      const { st_crvUSD } = requireLib('llamaApi')
      const hash = (isFull ? await st_crvUSD.redeem(userVaultShares) : await st_crvUSD.withdraw(withdrawAmount)) as Hex
      return { hash }
    },
    validationSuite: scrvUsdWithdrawMaxValidationSuite,
    validationParams: { chainId, userAddress },
    pendingMessage: ({ withdrawAmount }) =>
      t`Withdrawing... ${formatNumber(withdrawAmount, { abbreviate: false })} scrvUSD`,
    successMessage: ({ withdrawAmount }) =>
      t`Withdraw successful! ${formatNumber(withdrawAmount, { abbreviate: false })} scrvUSD`,
    onSuccess: async (data, receipt, variables, context) => {
      await invalidateScrvUsdMutationQueries({ chainId, config, userAddress })
      await onSuccess?.(data, receipt, variables, context)
    },
    ...props,
  })

  const onSubmit = useCallback((form: ScrvUsdWithdrawForm) => mutate(form as ScrvUsdWithdrawMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
