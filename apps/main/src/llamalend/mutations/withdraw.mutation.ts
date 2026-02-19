import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  WithdrawForm,
  WithdrawMutation,
  withdrawValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatTokenAmounts } from '../llama.utils'

export type WithdrawOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: OnTransactionSuccess<WithdrawMutation>
  onReset: () => void
  userAddress: Address | undefined
}

export const useWithdrawMutation = ({
  network,
  network: { chainId },
  marketId,
  onSuccess,
  onReset,
  userAddress,
}: WithdrawOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<WithdrawMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'withdraw'] as const,
    mutationFn: async (variables, { market }) => {
      const lendMarket = requireVault(market)
      return { hash: (await lendMarket.vault.withdraw(variables.withdrawAmount)) as Hex }
    },
    validationSuite: withdrawValidationSuite,
    pendingMessage: (mutation, { market }) =>
      t`Withdrawing... ${formatTokenAmounts(market, { userBorrowed: mutation.withdrawAmount })}`,
    successMessage: (mutation, { market }) =>
      t`Withdraw successful! ${formatTokenAmounts(market, { userBorrowed: mutation.withdrawAmount })}`,
    onSuccess,
    onReset,
  })

  const onSubmit = useCallback(async (form: WithdrawForm) => mutate(form as WithdrawMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
