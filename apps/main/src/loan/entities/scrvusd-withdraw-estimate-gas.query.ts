import type { BaseConfig } from '@ui/utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import type { ScrvUsdWithdrawParams, ScrvUsdWithdrawQuery } from './scrvusd.validation'
import { scrvUsdWithdrawMaxValidationSuite } from './scrvusd.validation'

const { useQuery: useScrvUsdWithdrawEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, withdrawAmount, isFull, maxWithdrawAmount }: ScrvUsdWithdrawParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'st_crvUSD.estimateGas.withdraw',
      { withdrawAmount },
      { isFull },
      { maxWithdrawAmount },
    ] as const,
  queryFn: async ({ withdrawAmount, isFull, maxWithdrawAmount }: ScrvUsdWithdrawQuery) =>
    await requireLib('llamaApi').st_crvUSD.estimateGas.redeem(isFull ? maxWithdrawAmount : withdrawAmount),
  category: 'savings.user',
  validationSuite: scrvUsdWithdrawMaxValidationSuite,
})

export const useScrvUsdWithdrawEstimateGas = (
  networks: Record<number, BaseConfig>,
  query: ScrvUsdWithdrawParams,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: withdrawEstimate,
    isLoading: withdrawLoading,
    error: withdrawError,
  } = useScrvUsdWithdrawEstimateGasQuery(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas(networks, chainId, withdrawEstimate, enabled && withdrawEstimate != null)

  return {
    data,
    isLoading: [withdrawLoading, conversionLoading].some(Boolean),
    error: [withdrawError, estimateError].find(Boolean) ?? null,
  }
}
