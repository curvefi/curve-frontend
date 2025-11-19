import { useCallback } from 'react'
import type { Hex } from 'viem'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  type RepayForm,
  repayFromCollateralValidationSuite,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'

type RepayMutation = { stateCollateral: Decimal; userCollateral: Decimal; userBorrowed: Decimal }

export type RepayOptions = {
  marketId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onRepaid?: LlammaMutationOptions<RepayMutation>['onSuccess']
}

export const useRepayMutation = ({ network, marketId, onRepaid }: RepayOptions) => {
  const { chainId } = network
  const { mutate, mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<RepayMutation>({
    network,
    marketId,
    mutationKey: ['manage-loan', 'repay', { chainId, marketId }] as const,
    mutationFn: async ({ userCollateral, userBorrowed, stateCollateral }, { market }) => ({
      hash:
        market instanceof LendMarketTemplate
          ? ((await market.leverage.repay(stateCollateral, userCollateral, userBorrowed)) as Hex)
          : market.leverageV2.hasLeverage()
            ? ((await market.leverageV2.repay(stateCollateral, userCollateral, userBorrowed)) as Hex)
            : ((await market.deleverage.repay(userCollateral)) as Hex),
    }),
    validationSuite: repayFromCollateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Repaying loan... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (_result, mutation, { market }) => t`Loan repaid! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onRepaid,
  })

  const onSubmit = useCallback((form: RepayForm) => mutateAsync(form as RepayMutation), [mutateAsync])

  return { onSubmit, mutate, mutateAsync, error, data, isPending, isSuccess, reset }
}
