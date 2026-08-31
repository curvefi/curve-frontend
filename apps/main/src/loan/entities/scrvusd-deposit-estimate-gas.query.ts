import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createApprovedEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import { useScrvUsdDepositIsApproved } from './scrvusd-deposit-is-approved.query'
import type { ScrvUsdDepositParams, ScrvUsdDepositQuery } from './scrvusd.validation'
import { scrvUsdDepositMaxValidationSuite } from './scrvusd.validation'

const { useQuery: useScrvUsdDepositApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'st_crvUSD.estimateGas.depositApprove',
      { depositAmount },
    ] as const,
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    await requireLib('llamaApi').st_crvUSD.estimateGas.depositApprove(depositAmount),
  category: 'savings.user',
  validationSuite: scrvUsdDepositMaxValidationSuite,
})

const { useQuery: useScrvUsdDepositEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.estimateGas.deposit', { depositAmount }] as const,
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    await requireLib('llamaApi').st_crvUSD.estimateGas.deposit(depositAmount),
  category: 'savings.user',
  validationSuite: scrvUsdDepositMaxValidationSuite,
})

/** Estimates scrvUSD deposit gas, using approval gas first when deposits are not approved. */
export const useScrvUsdDepositEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useScrvUsdDepositIsApproved,
  useApproveEstimate: useScrvUsdDepositApproveEstimateGas,
  useActionEstimate: useScrvUsdDepositEstimateGasQuery,
})
