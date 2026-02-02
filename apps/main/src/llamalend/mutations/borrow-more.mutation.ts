import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import {
  getBorrowMoreImplementation,
  getBorrowMoreImplementationArgs,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import {
  type BorrowMoreForm,
  BorrowMoreMutation,
  borrowMoreMutationValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { waitForApproval } from '@ui-kit/utils'

export type OnBorrowedMore = LlammaMutationOptions<BorrowMoreMutation>['onSuccess']

export type BorrowMoreOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onBorrowedMore?: OnBorrowedMore
  onReset?: () => void
  userAddress: Address | undefined
}

const approveBorrowMore = async (
  market: LlamaMarketTemplate,
  { userCollateral = '0', userBorrowed = '0', leverageEnabled }: BorrowMoreMutation,
): Promise<Hex[]> => {
  if (!+userCollateral && !+userBorrowed) return []
  const [type, impl] = getBorrowMoreImplementation(market.id, leverageEnabled)
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
  { userCollateral = '0', userBorrowed = '0', debt = '0', slippage, leverageEnabled }: BorrowMoreMutation,
): Promise<Hex> => {
  const [type, impl, args] = getBorrowMoreImplementationArgs(market.id, {
    userCollateral,
    userBorrowed,
    debt,
    leverageEnabled,
  })
  switch (type) {
    case 'V1':
    case 'V2':
      await impl.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage)
      return (await impl.borrowMore(...args, +slippage)) as Hex
    case 'unleveraged':
      return (await impl.borrowMore(...args)) as Hex
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
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<BorrowMoreMutation>({
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

  const onSubmit = useCallback(async (form: BorrowMoreForm) => mutate(form as BorrowMoreMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
