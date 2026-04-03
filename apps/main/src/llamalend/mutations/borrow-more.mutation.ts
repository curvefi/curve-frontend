import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
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
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { waitForApproval } from '@ui-kit/utils'

export type BorrowMoreOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}

const approveBorrowMore = async (
  market: LlamaMarketTemplate,
  { userCollateral = '0', userBorrowed = '0', leverageEnabled }: BorrowMoreMutation,
): Promise<Hex[]> => {
  const [type, impl] = getBorrowMoreImplementation(market.id, leverageEnabled)
  switch (type) {
    case 'zapV2':
      return (await impl.borrowMoreApprove({ userCollateral, userBorrowed })) as Hex[]
    case 'V1':
    case 'V2':
      return (await impl.borrowMoreApprove(userCollateral, userBorrowed)) as Hex[]
    case 'unleveraged':
      return (await impl.borrowMoreApprove(userCollateral)) as Hex[]
  }
}

const borrowMore = async (
  market: LlamaMarketTemplate,
  { userCollateral = '0', userBorrowed = '0', debt = '0', slippage, leverageEnabled, routeId }: BorrowMoreMutation,
): Promise<Hex> => {
  const [type, impl, args] = getBorrowMoreImplementationArgs(market.id, {
    userCollateral,
    userBorrowed,
    debt,
    leverageEnabled,
    routeId,
    slippage,
  })
  switch (type) {
    case 'zapV2':
      return (await impl.borrowMore(...args)) as Hex
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
  userAddress,
  ...props
}: BorrowMoreOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useLlammaMutation<BorrowMoreMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'borrowMore'] as const,
    mutationFn: async (variables, { market }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchBorrowMoreIsApproved({ marketId, chainId, userAddress, ...variables }, { staleTime: 0 }),
        onApprove: async () => await approveBorrowMore(market, variables),
        message: t`Approved borrow more`,
        config,
      })
      return { hash: await borrowMore(market, variables) }
    },
    validationSuite: borrowMoreMutationValidationSuite,
    pendingMessage: (mutation, { market }) => t`Borrowing more... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Borrowed more! ${formatTokenAmounts(market, mutation)}`,
    ...props,
  })

  const onSubmit = useCallback(async (form: BorrowMoreForm) => mutate(form as BorrowMoreMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
