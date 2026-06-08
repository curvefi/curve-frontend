import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import type { Address, Hex } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatNumber, waitForApproval } from '@ui-kit/utils'
import { fetchScrvUsdDepositIsApproved } from './scrvusd-deposit-approved.query'
import { invalidateScrvUsdMutationQueries } from './scrvusd-mutation.helpers'
import type { ScrvUsdDepositForm, ScrvUsdDepositMutation } from './scrvusd.validation'
import { scrvUsdDepositMaxValidationSuite } from './scrvusd.validation'

type ScrvUsdDepositOptions = {
  chainId: number
  userAddress: Address | undefined
  onReset: () => void
  onSuccess?: OnTransactionSuccess<ScrvUsdDepositMutation>
}

export const useScrvUsdDepositMutation = ({ chainId, userAddress, onSuccess, ...props }: ScrvUsdDepositOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<ScrvUsdDepositMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.deposit'] as const,
    mutationFn: async variables => {
      await waitForApproval({
        isApproved: async () =>
          await fetchScrvUsdDepositIsApproved(
            { chainId, userAddress, depositAmount: variables.depositAmount },
            { staleTime: 0 },
          ),
        onApprove: async () =>
          (await requireLib('llamaApi').st_crvUSD.depositApprove(
            variables.depositAmount,
            variables.approveInfinite,
          )) as Hex[],
        message: t`Approved deposit`,
        config,
      })

      return await requireLib('llamaApi')
        .st_crvUSD.deposit(variables.depositAmount)
        .then(hash => ({ hash: hash as Hex }))
    },
    validationSuite: scrvUsdDepositMaxValidationSuite,
    validationParams: { chainId, userAddress },
    pendingMessage: ({ depositAmount }) =>
      t`Depositing... ${formatNumber(depositAmount, { abbreviate: false })} crvUSD`,
    successMessage: ({ depositAmount }) =>
      t`Deposit successful! ${formatNumber(depositAmount, { abbreviate: false })} crvUSD`,
    onSuccess: async (data, receipt, variables, context) => {
      if (userAddress) {
        await invalidateScrvUsdMutationQueries({ chainId, config, userAddress })
      }
      await onSuccess?.(data, receipt, variables, context)
    },
    ...props,
  })

  const onSubmit = useCallback((form: ScrvUsdDepositForm) => mutate(form as ScrvUsdDepositMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
