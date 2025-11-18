import { useCallback } from 'react'
import type { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { invalidateUserMarketQueries } from '@/llamalend/queries/query.utils'
import type {
  IChainId as LlamaChainId,
  IChainId,
  INetworkName as LlamaNetworkId,
} from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { BaseConfig } from '@ui/utils'
import { notify, useConnection } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { Address } from '@ui-kit/utils'
import { waitForApproval } from '@ui-kit/utils/time.utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { fetchBorrowCreateLoanIsApproved } from '../queries/borrow-create-loan-approved.query'
import type { BorrowForm, BorrowFormQuery } from '../types'
import { borrowFormValidationSuite } from './borrow.validation'

type BorrowMutationContext = {
  chainId: IChainId
  marketId: string | undefined
}

type BorrowMutation = Omit<BorrowFormQuery, keyof BorrowMutationContext>

export type CreateLoanOptions = {
  marketId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onCreated: (hash: Hex, mutation: BorrowMutation & { txHash: Hex }) => void
  reset: () => void
}

const approve = async (
  market: LlamaMarketTemplate,
  { userCollateral, userBorrowed, leverageEnabled }: BorrowMutation,
) =>
  (leverageEnabled
    ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
      ? await market.leverageV2.createLoanApprove(userCollateral, userBorrowed)
      : await market.leverage.createLoanApprove(userCollateral, userBorrowed)
    : await market.createLoanApprove(userCollateral)) as Address[]

const create = async (
  market: LlamaMarketTemplate,
  { debt, userCollateral, userBorrowed, leverageEnabled, range, slippage }: BorrowMutation,
) => {
  if (leverageEnabled && (market instanceof LendMarketTemplate || market.leverageV2.hasLeverage())) {
    const parent = market instanceof LendMarketTemplate ? market.leverage : market.leverageV2
    return (await parent.createLoan(userCollateral, userBorrowed, debt, range, +slippage)) as Address
  }
  console.assert(!+userBorrowed, `userBorrowed not supported in this market`)
  const parent = leverageEnabled && market instanceof MintMarketTemplate ? market.leverage : market
  return (await parent.createLoan(userCollateral, debt, range, +slippage)) as Address
}

export const useCreateLoanMutation = ({ network, marketId, onCreated }: CreateLoanOptions) => {
  const config = useConfig()
  const { wallet } = useConnection()
  const { chainId } = network
  const mutationKey = ['create-loan', { chainId, marketId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<BorrowMutation, Hex>({
    marketId,
    mutationKey,
    mutationFn: async (mutation, { market }) => {
      assertValidity(borrowFormValidationSuite, mutation)

      const params = { ...mutation, chainId, marketId }
      await waitForApproval({
        isApproved: () => fetchBorrowCreateLoanIsApproved(params),
        onApprove: () => approve(market, mutation),
        message: t`Approved loan creation`,
        config,
      })

      const hash = await create(market, mutation)
      await waitForTransactionReceipt(config, { hash })
      return hash
    },
    pendingMessage: t`Creating loan`,
    onSuccess: async (txHash, mutation, { market }) => {
      logSuccess(mutationKey, txHash)
      notify(t`Loan created successfully`, 'success')
      const userAddress = wallet?.account.address
      await invalidateUserMarketQueries({ marketId, userAddress })
      updateUserEventsApi(wallet!, network, market, txHash)
      onCreated(txHash, { ...mutation, txHash })
    },
    onError: (error) => notify(error.message, 'error'),
  })

  const onSubmit = useCallback((data: BorrowForm) => mutateAsync(data as BorrowMutation), [mutateAsync])

  return { onSubmit, error, txHash: data, isPending, isSuccess, reset }
}
