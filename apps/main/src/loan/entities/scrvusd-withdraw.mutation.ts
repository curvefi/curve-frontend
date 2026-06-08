import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import type { Address, Hex } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatNumber } from '@ui-kit/utils'
import { invalidateScrvUsdMutationQueries } from './scrvusd-mutation.helpers'
import type { ScrvUsdWithdrawForm, ScrvUsdWithdrawMutation } from './scrvusd.validation'
import { scrvUsdWithdrawValidationSuite } from './scrvusd.validation'

type ScrvUsdWithdrawOptions = {
  chainId: number
  userAddress: Address | undefined
  onReset: () => void
  onSuccess?: OnTransactionSuccess<ScrvUsdWithdrawMutation>
}

export const useScrvUsdWithdrawMutation = ({ chainId, userAddress, onSuccess, ...props }: ScrvUsdWithdrawOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<ScrvUsdWithdrawMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.withdraw'] as const,
    mutationFn: async ({ withdrawAmount, isFull, userVaultShares }) =>
      await (
        isFull
          ? requireLib('llamaApi').st_crvUSD.redeem(userVaultShares)
          : requireLib('llamaApi').st_crvUSD.withdraw(withdrawAmount)
      ).then(hash => ({ hash: hash as Hex })),
    validationSuite: scrvUsdWithdrawValidationSuite,
    validationParams: { chainId, userAddress },
    pendingMessage: ({ withdrawAmount }) =>
      t`Withdrawing... ${formatNumber(withdrawAmount, { abbreviate: false })} scrvUSD`,
    successMessage: ({ withdrawAmount }) =>
      t`Withdraw successful! ${formatNumber(withdrawAmount, { abbreviate: false })} scrvUSD`,
    onSuccess: async (data, receipt, variables, context) => {
      if (userAddress) {
        await invalidateScrvUsdMutationQueries({ chainId, config, userAddress })
      }
      await onSuccess?.(data, receipt, variables, context)
    },
    ...props,
  })

  const onSubmit = useCallback(
    ({ withdrawAmount = '0', userVaultShares = '0', ...form }: ScrvUsdWithdrawForm) =>
      mutate({ ...form, withdrawAmount, userVaultShares, isFull: form.isFull }),
    [mutate],
  )

  return { onSubmit, mutate, error, isPending }
}
