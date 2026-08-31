import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
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

export const useScrvUsdWithdrawEstimateGas = createEstimateGasHook(useScrvUsdWithdrawEstimateGasQuery)
