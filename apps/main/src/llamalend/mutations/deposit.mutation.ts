import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  DepositForm,
  DepositMutation,
  depositValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { waitForApproval } from '@ui-kit/utils'
import { formatTokenAmounts } from '../llama.utils'

export type DepositOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onDeposited?: LlammaMutationOptions<DepositMutation>['onSuccess']
  onReset: () => void
  userAddress: Address | undefined
}

const approveDeposit = async (market: LendMarketTemplate, { depositAmount = '0' }: DepositMutation): Promise<Hex[]> =>
  !+depositAmount ? [] : ((await market.vault.depositApprove(depositAmount)) as Hex[])

const deposit = async (market: LendMarketTemplate, { depositAmount }: DepositMutation): Promise<Hex> =>
  (await market.vault.deposit(depositAmount)) as Hex

export const useDepositMutation = ({
  network,
  network: { chainId },
  marketId,
  onDeposited,
  onReset,
  userAddress,
}: DepositOptions) => {
  const config = useConfig()

  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<DepositMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'deposit'] as const,
    mutationFn: async (mutation, { market }) => {
      market = requireVault(market)
      await waitForApproval({
        isApproved: async () => await fetchDepositIsApproved({ chainId, marketId, ...mutation }, { staleTime: 0 }),
        onApprove: async () => await approveDeposit(market, mutation),
        message: t`Approved deposit`,
        config,
      })

      return { hash: await deposit(market, mutation) }
    },
    validationSuite: depositValidationSuite,
    pendingMessage: (mutation, { market }) =>
      t`Depositing... ${formatTokenAmounts(market, { userBorrowed: mutation.depositAmount })}`,
    successMessage: (mutation, { market }) =>
      t`Deposit successful! ${formatTokenAmounts(market, { userBorrowed: mutation.depositAmount })}`,
    onSuccess: onDeposited,
    onReset,
  })

  const onSubmit = useCallback(async (form: DepositForm) => mutate(form as DepositMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
