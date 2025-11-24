import { useCallback } from 'react'
import { Config as WagmiConfig, useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchBorrowCreateLoanIsApproved } from '@/llamalend/queries/create-loan/borrow-create-loan-approved.query'
import { borrowFormValidationSuite } from '@/llamalend/queries/validation/borrow.validation'
import type {
  IChainId as LlamaChainId,
  IChainId,
  INetworkName as LlamaNetworkId,
} from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { Address, waitForApproval } from '@ui-kit/utils'
import type { BorrowForm, BorrowFormQuery } from '../features/borrow/types'

type BorrowMutationContext = {
  chainId: IChainId
  marketId: string | undefined
}

export type BorrowMutation = Omit<BorrowFormQuery, keyof BorrowMutationContext>

export type CreateLoanOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onCreated: LlammaMutationOptions<BorrowMutation>['onSuccess']
  onReset: () => void
  userAddress: Address | undefined
}

export const approveLoan = async (
  market: LlamaMarketTemplate,
  { userCollateral, userBorrowed, leverageEnabled }: BorrowMutation,
) =>
  (leverageEnabled
    ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
      ? await market.leverageV2.createLoanApprove(userCollateral, userBorrowed)
      : await market.leverage.createLoanApprove(userCollateral, userBorrowed)
    : await market.createLoanApprove(userCollateral)) as Address[]

export const createLoan = async (
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

const approveAndCreateLoan = async ({
  config,
  market,
  ...mutation
}: BorrowMutation & {
  chainId: IChainId
  market: MintMarketTemplate | LendMarketTemplate
  config: WagmiConfig
}) => {
  await waitForApproval({
    isApproved: () => fetchBorrowCreateLoanIsApproved({ ...mutation, marketId: market.id }),
    onApprove: () => approveLoan(market, mutation),
    message: t`Approved loan creation`,
    config,
  })
  return { hash: await createLoan(market, mutation) }
}

export const useCreateLoanMutation = ({
  network,
  network: { chainId },
  marketId,
  onCreated,
  onReset,
  userAddress,
}: CreateLoanOptions) => {
  const config = useConfig()

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<BorrowMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'create-loan'] as const,
    mutationFn: async (mutation, { market }) => await approveAndCreateLoan({ ...mutation, chainId, market, config }),
    validationSuite: borrowFormValidationSuite,
    pendingMessage: (mutation, { market }) => t`Creating loan... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Loan created! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onCreated,
    onReset,
  })

  const onSubmit = useCallback((data: BorrowForm) => mutateAsync(data as BorrowMutation), [mutateAsync])

  return { onSubmit, error, data, isPending, isSuccess, reset }
}
