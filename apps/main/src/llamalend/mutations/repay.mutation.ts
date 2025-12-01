import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  type RepayForm,
  repayFromCollateralValidationSuite,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'

type RepayMutation = { stateCollateral: Decimal; userCollateral: Decimal; userBorrowed: Decimal }

export type RepayOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onRepaid: LlammaMutationOptions<RepayMutation>['onSuccess']
  onReset?: () => void
  userAddress: Address | undefined
  leverageEnabled: boolean
}

export const useRepayMutation = ({
  network,
  network: { chainId },
  marketId,
  onRepaid,
  onReset,
  userAddress,
  leverageEnabled,
}: RepayOptions) => {
  const { mutate, mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<RepayMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'repay', { leverageEnabled }] as const,
    mutationFn: async ({ userCollateral, userBorrowed, stateCollateral }, { market }) => ({
      hash: leverageEnabled
        ? market instanceof LendMarketTemplate
          ? ((await market.leverage.repay(stateCollateral, userCollateral, userBorrowed)) as Hex)
          : market.leverageV2.hasLeverage()
            ? ((await market.leverageV2.repay(stateCollateral, userCollateral, userBorrowed)) as Hex)
            : ((await market.deleverage.repay(userCollateral)) as Hex)
        : ((await market.repay(userCollateral)) as Hex),
    }),
    validationSuite: repayFromCollateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Repaying loan... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Loan repaid! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onRepaid,
    onReset,
  })

  const onSubmit = useCallback((form: RepayForm) => mutateAsync(form as RepayMutation), [mutateAsync])

  return { onSubmit, mutate, mutateAsync, error, data, isPending, isSuccess, reset }
}
