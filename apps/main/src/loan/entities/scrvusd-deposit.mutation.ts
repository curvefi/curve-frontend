import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import type { ChainId } from '@/loan/types/loan.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { type OnTransactionSuccess, useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import { fetchScrvUsdDepositIsApproved } from './scrvusd-deposit-is-approved.query'
import { invalidateScrvUsdMutationQueries } from './scrvusd-mutation.helpers'
import type { ScrvUsdDepositForm, ScrvUsdDepositMutation } from './scrvusd.validation'
import { scrvUsdDepositMaxValidationSuite } from './scrvusd.validation'

type ScrvUsdDepositOptions = {
  chainId: ChainId
  userAddress: Address | undefined
  onReset: () => void
  onSuccess?: OnTransactionSuccess<ScrvUsdDepositMutation>
}

export const useScrvUsdDepositMutation = ({ chainId, userAddress, onSuccess, ...props }: ScrvUsdDepositOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useEvmMutation<ScrvUsdDepositMutation>({
    mutationKey: [{ ...rootKeys.userChain({ chainId, userAddress }), name: 'st_crvUSD.deposit' }] as const,
    mutationFn: async ({ approveInfinite, depositAmount }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchScrvUsdDepositIsApproved({ chainId, userAddress, depositAmount }, { staleTime: 0 }),
        onApprove: async () =>
          (await requireLib('llamaApi').st_crvUSD.depositApprove(depositAmount, approveInfinite)) as Hex[],
        message: t`Approved deposit`,
        config,
      })
      const hash = (await requireLib('llamaApi').st_crvUSD.deposit(depositAmount)) as Hex
      return { hash }
    },
    validationSuite: scrvUsdDepositMaxValidationSuite,
    validationParams: { chainId, userAddress },
    pendingMessage: ({ depositAmount }) => t`Depositing... ${formatToken(depositAmount, 'crvUSD', 'amount')}`,
    successMessage: ({ depositAmount }) => t`Deposit successful! ${formatToken(depositAmount, 'crvUSD', 'amount')}`,
    onSuccess: async (data, receipt, variables, context) => {
      await invalidateScrvUsdMutationQueries({ chainId, config, userAddress })
      await onSuccess?.(data, receipt, variables, context)
    },
    ...props,
  })

  const onSubmit = useCallback((form: ScrvUsdDepositForm) => mutate(form as ScrvUsdDepositMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
