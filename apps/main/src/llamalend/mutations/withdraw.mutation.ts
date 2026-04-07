import { useCallback } from 'react'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  type WithdrawForm,
  WithdrawMutation,
  withdrawValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { formatTokenAmounts } from '../llama.utils'

export type WithdrawOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}

export const useWithdrawMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  ...props
}: WithdrawOptions) => {
  const { mutate, error, isPending } = useLlammaMutation<WithdrawMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'withdraw'] as const,
    mutationFn: async ({ userVaultShares, withdrawAmount, isFull }, { market }) => {
      const lendMarket = requireVault(market)
      return {
        hash: isFull
          ? ((await lendMarket.vault.redeem(userVaultShares)) as Hex)
          : ((await lendMarket.vault.withdraw(withdrawAmount)) as Hex),
      }
    },
    validationSuite: withdrawValidationSuite,
    pendingMessage: (mutation, { market }) =>
      t`Withdrawing... ${formatTokenAmounts(market, { userBorrowed: mutation.withdrawAmount })}`,
    successMessage: (mutation, { market }) =>
      t`Withdraw successful! ${formatTokenAmounts(market, { userBorrowed: mutation.withdrawAmount })}`,
    mutationTokenAddresses: (_variables, { market }) =>
      [requireVault(market).borrowed_token.address, requireVault(market).addresses.vault] as Address[],
    ...props,
  })

  const onSubmit = useCallback(
    async ({ withdrawAmount = '0', userVaultShares = '0', ...form }: WithdrawForm) =>
      mutate({
        ...form,
        userVaultShares,
        withdrawAmount,
      } as WithdrawMutation),
    [mutate],
  )

  return { onSubmit, mutate, error, isPending }
}
