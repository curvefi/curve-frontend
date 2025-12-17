import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import {
  type RepayForm,
  repayFromCollateralIsFullValidationSuite,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type Decimal, waitForApproval } from '@ui-kit/utils'

type RepayMutation = { stateCollateral: Decimal; userCollateral: Decimal; userBorrowed: Decimal; isFull: boolean }

export type RepayOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onRepaid?: LlammaMutationOptions<RepayMutation>['onSuccess']
  onReset?: () => void
  userAddress: Address | undefined
}

const approveRepay = async (market: LlamaMarketTemplate, { userCollateral, userBorrowed, isFull }: RepayMutation) => {
  if (isFull) {
    return (await market.fullRepayApprove()) as Hex[]
  }
  if (market instanceof LendMarketTemplate) {
    return (await market.leverage.repayApprove(userCollateral, userBorrowed)) as Hex[]
  }
  if (market.leverageV2.hasLeverage()) {
    return (await market.leverageV2.repayApprove(userCollateral, userBorrowed)) as Hex[]
  }
  console.assert(!+userCollateral, `userCollateral should be 0 for non-leverage repay`)
  return (await market.repayApprove(userBorrowed)) as Hex[]
}

const repay = async (market: LlamaMarketTemplate, mutation: RepayMutation): Promise<Hex> => {
  const { stateCollateral, userCollateral, userBorrowed, isFull } = mutation
  if (isFull) {
    return (await market.fullRepay()) as Hex
  }

  if (market instanceof LendMarketTemplate) {
    await market.leverage.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed)
    return (await market.leverage.repay(stateCollateral, userCollateral, userBorrowed)) as Hex
  }

  if (market.leverageV2.hasLeverage()) {
    await market.leverageV2.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed)
    return (await market.leverageV2.repay(stateCollateral, userCollateral, userBorrowed)) as Hex
  }

  console.assert(!+stateCollateral, `stateCollateral should be 0 for non-leverage repay`)
  console.assert(!+userBorrowed, `userBorrowed should be 0 for non-leverage repay`)
  return (await market.deleverage.repay(userCollateral)) as Hex
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
      const { stateCollateral, userBorrowed, userCollateral, isFull } = mutation

      await waitForApproval({
        isApproved: () =>
          fetchRepayIsApproved(
            {
              chainId,
              marketId,
              userAddress,
              stateCollateral,
              userCollateral,
              userBorrowed,
              isFull,
            },
            { staleTime: 0 },
          ),
        onApprove: () => approveRepay(market, mutation),
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
