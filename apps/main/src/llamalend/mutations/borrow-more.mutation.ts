import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import {
  type BorrowMoreForm,
  borrowMoreMutationValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type Decimal, waitForApproval } from '@ui-kit/utils'

type BorrowMoreMutation = {
  userCollateral: Decimal
  userBorrowed: Decimal
  debt: Decimal
  slippage: Decimal
}

export type BorrowMoreOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onBorrowedMore?: LlammaMutationOptions<BorrowMoreMutation>['onSuccess']
  onReset?: () => void
  userAddress: Address | undefined
}

const approveBorrowMore = async (
  market: LlamaMarketTemplate,
  { userCollateral = '0', userBorrowed = '0' }: BorrowMoreMutation,
): Promise<Hex[]> => {
  if (!+userCollateral && !+userBorrowed) return []
  const [type, impl] = getBorrowMoreImplementation(market.id, { userCollateral, userBorrowed })
  switch (type) {
    case 'V1':
    case 'V2':
      return (await impl.borrowMoreApprove(userCollateral, userBorrowed)) as Hex[]
    case 'unleveraged':
      return (await impl.borrowMoreApprove(userCollateral)) as Hex[]
  }
}

const borrowMore = async (
  market: LlamaMarketTemplate,
  { userCollateral = '0', userBorrowed = '0', debt = '0', slippage }: BorrowMoreMutation,
): Promise<Hex> => {
  const [type, impl] = getBorrowMoreImplementation(market.id, { userCollateral, userBorrowed })
  switch (type) {
    case 'V1':
    case 'V2':
      await impl.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage)
      return (await impl.borrowMore(userCollateral, userBorrowed, debt, +slippage)) as Hex
    case 'unleveraged':
      return (await impl.borrowMore(userCollateral, debt)) as Hex
  }
}

export const useBorrowMoreMutation = ({
  network,
  network: { chainId },
  marketId,
  onBorrowedMore,
  onReset,
  userAddress,
}: BorrowMoreOptions) => {
  const config = useConfig()
  const { mutate, mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<BorrowMoreMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'borrowMore'] as const,
    mutationFn: async (mutation, { market }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchBorrowMoreIsApproved({ marketId, chainId, userAddress, ...mutation }, { staleTime: 0 }),
        onApprove: async () => await approveBorrowMore(market, mutation),
        message: t`Approved borrow more`,
        config,
      })
      return { hash: await borrowMore(market, mutation) }
    },
    validationSuite: borrowMoreMutationValidationSuite,
    pendingMessage: (mutation, { market }) => t`Borrowing more... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Borrowed more! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onBorrowedMore,
    onReset,
  })

  const onSubmit = useCallback(async (form: BorrowMoreForm) => mutateAsync(form as BorrowMoreMutation), [mutateAsync])

  return { onSubmit, mutate, mutateAsync, error, data, isPending, isSuccess, reset }
}
