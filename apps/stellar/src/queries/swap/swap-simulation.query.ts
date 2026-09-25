import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { SwapParams, SwapQuery } from '@/stellar/features/swap/types'
import { rootKeys } from '@/stellar/queries/root-keys'
import { swapValidationSuite } from '@/stellar/queries/validation/swap.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { toWei } from '@ui/lib/decimal'

export const {
  useQuery: useSwapSimulation,
  fetchQuery: fetchSwapSimulation,
  getQueryOptions: getSwapSimulationQueryOptions,
  invalidate: invalidateSwapSimulation,
} = queryFactory({
  queryKey: ({ network, pool, account, fromIndex, toIndex, inputAmount, decimals, minimum, maxAmount }: SwapParams) =>
    [
      rootKeys.pool({ network, pool }),
      { name: 'exchange', account, fromIndex, toIndex, inputAmount, decimals, minimum, maxAmount },
    ] as const,
  queryFn: ({ network, pool, account, fromIndex, toIndex, inputAmount, decimals, minimum }: SwapQuery) =>
    simulateContractCall<bigint>(
      network,
      pool,
      'exchange',
      [
        account,
        fromIndex,
        toIndex,
        BigInt(toWei(inputAmount, decimals[fromIndex])),
        BigInt(toWei(minimum, decimals[toIndex])),
        account,
      ],
      account,
    ),
  category: 'global.no-persist', // values returned by the SDK lose the built transaction, disable persistence for now
  validationSuite: swapValidationSuite,
})
