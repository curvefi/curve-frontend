import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { createLoanQueryValidationSuite } from '@/llamalend/queries/validation/borrow.validation'
import type {
  IChainId as LlamaChainId,
  IChainId,
  INetworkName as LlamaNetworkId,
} from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { Address, waitForApproval } from '@ui-kit/utils'
import type { CreateLoanForm, CreateLoanFormQuery } from '../features/borrow/types'

type CreateLoanMutationContext = {
  chainId: IChainId
  marketId: string | undefined
}

export type CreateLoanMutation = Omit<CreateLoanFormQuery, keyof CreateLoanMutationContext>

export type CreateLoanOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onCreated: OnTransactionSuccess<CreateLoanMutation>
  onReset: () => void
  userAddress: Address | undefined
}

const approve = async (
  market: LlamaMarketTemplate,
  { userCollateral, userBorrowed, leverageEnabled }: CreateLoanMutation,
) =>
  (leverageEnabled
    ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
      ? await market.leverageV2.createLoanApprove(userCollateral, userBorrowed)
      : await market.leverage.createLoanApprove(userCollateral, userBorrowed)
    : await market.createLoanApprove(userCollateral)) as Address[]

const create = async (
  market: LlamaMarketTemplate,
  { debt, userCollateral, userBorrowed, leverageEnabled, range, slippage }: CreateLoanMutation,
) => {
  if (leverageEnabled && (market instanceof LendMarketTemplate || market.leverageV2.hasLeverage())) {
    const parent = market instanceof LendMarketTemplate ? market.leverage : market.leverageV2
    return (await parent.createLoan(userCollateral, userBorrowed, debt, range, +slippage)) as Address
  }
  console.assert(!+userBorrowed, `userBorrowed not supported in this market`)
  const parent = leverageEnabled && market instanceof MintMarketTemplate ? market.leverage : market
  return (await parent.createLoan(userCollateral, debt, range, +slippage)) as Address
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

  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<CreateLoanMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'createLoan'] as const,
    mutationFn: async (variables, { market }) => {
      const params = { ...variables, chainId, marketId }
      await waitForApproval({
        isApproved: async () => await fetchCreateLoanIsApproved(params, { staleTime: 0 }),
        onApprove: () => approve(market, variables),
        message: t`Approved loan creation`,
        config,
      })
      return { hash: await create(market, variables) }
    },
    validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
    pendingMessage: (mutation, { market }) => t`Creating loan... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Loan created! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onCreated,
    onReset,
  })

  const onSubmit = useCallback((data: CreateLoanForm) => mutate(data as CreateLoanMutation), [mutate])

  return { onSubmit, error, data, isPending, isSuccess, reset }
}
