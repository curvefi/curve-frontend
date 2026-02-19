import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
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
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { waitForApproval } from '@ui-kit/utils'

export type OnBorrowedMore = OnTransactionSuccess<BorrowMoreMutation>

export type BorrowMoreOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: OnBorrowedMore
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
  { userCollateral = '0', userBorrowed = '0', debt = '0', slippage, leverageEnabled, route }: BorrowMoreMutation,
): Promise<Hex> => {
  const [type, impl, args] = getBorrowMoreImplementationArgs(market.id, {
    userCollateral,
    userBorrowed,
    debt,
    leverageEnabled,
    route,
  })
  switch (type) {
    case 'zapV2':
      return (await impl.borrowMore({
        userCollateral,
        userBorrowed,
        debt,
        router: route!.routerAddress,
        calldata: route!.calldata,
      })) as Hex
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
  onSuccess,
  onReset,
  userAddress,
}: BorrowMoreOptions) => {
  const config = useConfig()
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<BorrowMoreMutation>({
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
    onSuccess,
    onReset,
  })

  const onSubmit = useCallback(async (form: BorrowMoreForm) => mutate(form as BorrowMoreMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
