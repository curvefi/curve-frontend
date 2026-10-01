import { requireLib } from '@evm-ui/features/connect-wallet'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import type { ScrvUsdWithdrawParams, ScrvUsdWithdrawQuery } from './scrvusd.validation'
import { scrvUsdWithdrawMaxValidationSuite } from './scrvusd.validation'

const { useQuery: useScrvUsdWithdrawEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, withdrawAmount, isFull, maxWithdrawAmount }: ScrvUsdWithdrawParams) => ({
    name: 'st_crvUSD.estimateGas.withdraw',
    ...rootKeys.userChain({ chainId, userAddress }),
    withdrawAmount,
    isFull,
    maxWithdrawAmount,
  }),
  queryFn: async ({ withdrawAmount, isFull, maxWithdrawAmount }: ScrvUsdWithdrawQuery) =>
    await requireLib('llamaApi').st_crvUSD.estimateGas.redeem(isFull ? maxWithdrawAmount : withdrawAmount),
  category: 'savings.user',
  validationSuite: scrvUsdWithdrawMaxValidationSuite,
})

export const useScrvUsdWithdrawEstimateGas = createEstimateGasHook(useScrvUsdWithdrawEstimateGasQuery)
