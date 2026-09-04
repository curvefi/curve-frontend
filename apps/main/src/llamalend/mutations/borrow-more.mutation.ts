import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketMutation } from '@/llamalend/mutations/useMarketMutation'
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
import { rootKeys } from '@evm-ui/lib/model'
import { waitForApproval } from '@evm-ui/utils'
import { type Address, type Hex } from '@primitives/address.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { t } from '@ui/lib/i18n'

type BorrowMoreOptions = {
  marketId: string | undefined
  network: { blockchainId: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
  leverageProviders: readonly RouteProvider[] | undefined
}

const approveBorrowMore = async (
  market: MarketTemplate,
  { userCollateral = '0', leverageEnabled }: BorrowMoreMutation,
): Promise<Hex[]> => {
  const [type, impl] = getBorrowMoreImplementation(market.id, leverageEnabled)
  switch (type) {
    case 'zapV2':
      return (await impl.borrowMoreApprove({ userCollateral })) as Hex[]
    case 'unleveraged':
      return (await impl.borrowMoreApprove(userCollateral)) as Hex[]
  }
}

const borrowMore = async (
  market: MarketTemplate,
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
    case 'unleveraged':
      return (await impl.borrowMore(...args)) as Hex
  }
}

export const useBorrowMoreMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  leverageProviders,
  ...props
}: BorrowMoreOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useMarketMutation<BorrowMoreMutation>({
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
    validationSuite: borrowMoreMutationValidationSuite(leverageProviders),
    pendingMessage: (mutation, { market }) => t`Borrowing more... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Borrowed more! ${formatTokenAmounts(market, mutation)}`,
    ...props,
  })

  const onSubmit = useCallback((form: BorrowMoreForm) => mutate(form as BorrowMoreMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
