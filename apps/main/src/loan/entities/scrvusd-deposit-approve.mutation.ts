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
import type { ScrvUsdDepositMutation } from './scrvusd.validation'
import { scrvUsdDepositValidationSuite } from './scrvusd.validation'

type ScrvUsdDepositApproveOptions = {
  chainId: ChainId
  userAddress: Address | undefined
  onReset: () => void
  onSuccess?: OnTransactionSuccess<ScrvUsdDepositMutation>
}

export const useScrvUsdDepositApproveMutation = ({
  chainId,
  userAddress,
  onSuccess,
  ...props
}: ScrvUsdDepositApproveOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<ScrvUsdDepositMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.depositApprove'] as const,
    mutationFn: async ({ depositAmount, approveInfinite }) =>
      await requireLib('llamaApi')
        .st_crvUSD.depositApprove(depositAmount, approveInfinite)
        .then(([hash]) => ({ hash: hash as Hex })),
    validationSuite: scrvUsdDepositValidationSuite,
    validationParams: { chainId, userAddress },
    pendingMessage: ({ depositAmount }) => t`Approving... ${formatNumber(depositAmount, { abbreviate: false })} crvUSD`,
    successMessage: ({ depositAmount }) => t`Approved! ${formatNumber(depositAmount, { abbreviate: false })} crvUSD`,
    onSuccess: async (data, receipt, variables, context) => {
      await invalidateScrvUsdMutationQueries({ chainId, config, userAddress })
      await onSuccess?.(data, receipt, variables, context)
    },
    ...props,
  })

  const onSubmit = useCallback((form: ScrvUsdDepositMutation) => mutate(form), [mutate])

  return { onSubmit, mutate, error, isPending }
}
