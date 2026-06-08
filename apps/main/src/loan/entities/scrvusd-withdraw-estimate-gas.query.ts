import type { BaseConfig } from '@ui/utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import type { ScrvUsdWithdrawParams, ScrvUsdWithdrawQuery } from './scrvusd.validation'
import { scrvUsdWithdrawValidationSuite } from './scrvusd.validation'

export const { useQuery: useScrvUsdWithdrawEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, withdrawAmount, isFull, userVaultShares }: ScrvUsdWithdrawParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'st_crvUSD.estimateGas.withdraw',
      { withdrawAmount },
      { isFull },
      { userVaultShares },
    ] as const,
  queryFn: async ({ withdrawAmount, isFull, userVaultShares }: ScrvUsdWithdrawQuery) =>
    await (isFull
      ? requireLib('llamaApi').st_crvUSD.estimateGas.redeem(userVaultShares)
      : requireLib('llamaApi').st_crvUSD.estimateGas.withdraw(withdrawAmount)),
  category: 'savings.user',
  validationSuite: scrvUsdWithdrawValidationSuite,
})

export const useScrvUsdWithdrawEstimateGas = <ChainId extends number>(
  networks: Record<number, BaseConfig>,
  query: ScrvUsdWithdrawParams<ChainId>,
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
