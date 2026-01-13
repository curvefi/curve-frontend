import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { getRepayImplementation } from '@/llamalend/queries/repay/repay-query.helpers'
import {
  type RepayForm,
  repayFromCollateralIsFullValidationSuite,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type Decimal, waitForApproval } from '@ui-kit/utils'

type RepayMutation = {
  stateCollateral: Decimal
  userCollateral: Decimal
  userBorrowed: Decimal
  isFull: boolean
  slippage: Decimal
}

export type RepayOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onRepaid?: LlammaMutationOptions<RepayMutation>['onSuccess']
  onReset?: () => void
  userAddress: Address | undefined
}

const approveRepay = async (
  market: LlamaMarketTemplate,
  { stateCollateral, userCollateral, userBorrowed, isFull }: RepayMutation,
) => {
  if (isFull && !+stateCollateral && !+userCollateral) {
    return (await market.fullRepayApprove()) as Hex[]
  }
  const [type, impl] = getRepayImplementation(market.id, { userCollateral, stateCollateral, userBorrowed })
  switch (type) {
    case 'V1':
    case 'V2':
      return (await impl.repayApprove(userCollateral, userBorrowed)) as Hex[]
    case 'deleverage':
      return [] // no approve needed, paying from state
    case 'unleveraged':
      return (await impl.repayApprove(userBorrowed)) as Hex[]
  }
}

const repay = async (
  market: LlamaMarketTemplate,
  { stateCollateral, userCollateral, userBorrowed, isFull, slippage }: RepayMutation,
): Promise<Hex> => {
  if (isFull && !+stateCollateral && !+userCollateral) {
    return (await market.fullRepay()) as Hex
  }
  const [type, impl] = getRepayImplementation(market.id, { userCollateral, stateCollateral, userBorrowed })
  switch (type) {
    case 'V1':
    case 'V2':
      await impl.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed, +slippage)
      return (await impl.repay(stateCollateral, userCollateral, userBorrowed, +slippage)) as Hex
    case 'deleverage':
      return (await impl.repay(stateCollateral, +slippage)) as Hex
    case 'unleveraged':
      return (await impl.repay(userBorrowed)) as Hex
  }
}

export const useRepayMutation = ({
  network,
  network: { chainId },
  marketId,
  onRepaid,
  onReset,
  userAddress,
}: RepayOptions) => {
  const config = useConfig()
  const { mutate, mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<RepayMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'repay'] as const,
    mutationFn: async (mutation, { market }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchRepayIsApproved({ marketId, chainId, userAddress, ...mutation }, { staleTime: 0 }),
        onApprove: async () => await approveRepay(market, mutation),
        message: t`Approved repayment`,
        config,
      })
      return { hash: await repay(market, mutation) }
    },
    validationSuite: repayFromCollateralIsFullValidationSuite,
    pendingMessage: (mutation, { market }) => t`Repaying loan... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Loan repaid! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onRepaid,
    onReset,
  })

  const onSubmit = useCallback((form: RepayForm) => mutateAsync(form as RepayMutation), [mutateAsync])

  return { onSubmit, mutate, mutateAsync, error, data, isPending, isSuccess, reset }
}
