import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchResetIsApproved } from '@/llamalend/queries/reset/reset-is-approved.query'
import { getResetDebtReduction, getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import { type ResetForm, resetValidationSuite } from '@/llamalend/queries/validation/reset.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { waitForApproval } from '@ui-kit/utils'

type ResetMutation = ResetForm

// We want the toasts to show the entire debt amount being paid off, not just whatever the user added from their wallet.
const formatResetTokenAmounts = (market: MarketTemplate, mutation: ResetMutation) =>
  formatTokenAmounts(market, { userBorrowed: getResetDebtReduction(mutation) })

type ResetOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}

export const useResetMutation = ({ network, network: { chainId }, marketId, userAddress, ...props }: ResetOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useLlammaMutation<ResetMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'reset'] as const,
    mutationFn: async (variables, { market, userAddress }) => {
      const debt = variables.userBorrowed ?? '0' // The reset amount paid from wallet.
      await waitForApproval({
        isApproved: async () =>
          await fetchResetIsApproved({ marketId, chainId, userAddress, ...variables }, { staleTime: 0 }),
        onApprove: async () => (await getResetImplementation(market).repayApprove(debt)) as Hex[],
        message: t`Approved reset`,
        config,
      })
      return {
        hash: (await getResetImplementation(market).repay({ debt, address: userAddress, shrink: true })) as Hex,
      }
    },
    pendingMessage: (mutation, { market }) => t`Resetting position... ${formatResetTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Position reset! ${formatResetTokenAmounts(market, mutation)}`,
    validationSuite: resetValidationSuite,
    ...props,
  })

  const onSubmit = useCallback(
    ({ convertedBorrowed = '0', userBorrowed = '0', ...values }: ResetForm) =>
      mutate({ ...values, convertedBorrowed, userBorrowed }),
    [mutate],
  )

  return { onSubmit, mutate, error, isPending }
}
