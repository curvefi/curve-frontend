import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { createLoanQueryValidationSuite } from '@/llamalend/queries/validation/borrow.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { parseRoute as parseRoute } from '@ui-kit/entities/router-api'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { waitForApproval } from '@ui-kit/utils'
import type { CreateLoanForm, CreateLoanFormQuery } from '../features/borrow/types'

type CreateLoanMutationContext = {
  chainId: LlamaChainId
  marketId: string | undefined
}

export type CreateLoanMutation = Omit<CreateLoanFormQuery, keyof CreateLoanMutationContext>

export type CreateLoanOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess: OnTransactionSuccess<CreateLoanMutation>
  onReset: () => void
  userAddress: Address | undefined
}

const approve = async (
  market: LlamaMarketTemplate,
  { userCollateral, userBorrowed, leverageEnabled }: CreateLoanMutation,
) => {
  const [type, impl] = getCreateLoanImplementation(market.id, leverageEnabled)
  switch (type) {
    case 'zapV2':
      return (await impl.createLoanApprove({ userCollateral, userBorrowed })) as Address[]
    case 'V2':
    case 'V1':
      return (await impl.createLoanApprove(userCollateral, userBorrowed)) as Address[]
    case 'V0':
    case 'unleveraged':
      return (await impl.createLoanApprove(userCollateral)) as Address[]
  }
}

const create = async (
  market: LlamaMarketTemplate,
  { debt, userCollateral, userBorrowed, leverageEnabled, range, slippage, routeId }: CreateLoanMutation,
) => {
  const [type, impl] = getCreateLoanImplementation(market.id, leverageEnabled)
  switch (type) {
    case 'zapV2':
      return (await impl.createLoan({ userCollateral, userBorrowed, debt, range, ...parseRoute(routeId) })) as Address
    case 'V2':
    case 'V1':
      return (await impl.createLoan(userCollateral, userBorrowed, debt, range, +slippage)) as Address
    case 'V0':
    case 'unleveraged':
      return (await impl.createLoan(userCollateral, debt, range, +slippage)) as Address
  }
}

export const useCreateLoanMutation = ({
  network,
  network: { chainId },
  marketId,
  onSuccess,
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
    onSuccess,
    onReset,
  })

  const onSubmit = useCallback((data: CreateLoanForm) => mutate(data as CreateLoanMutation), [mutate])

  return { onSubmit, error, data, isPending, isSuccess, reset }
}
