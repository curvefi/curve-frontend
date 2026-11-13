import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { SwapParams, SwapQuery } from '@/stellar/features/swap/types'
import { swapValidationSuite } from '@/stellar/queries/validation/swap.validation'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { toWei } from '@ui/lib/decimal'

export const {
  useQuery: useSwapSimulation,
  fetchQuery: fetchSwapSimulation,
  getQueryOptions: getSwapSimulationQueryOptions,
  invalidate: invalidateSwapSimulation,
} = queryFactory({
  queryKey: ({
    network,
    pool,
    account,
    fromIndex,
    toIndex,
    inputAmount,
    decimals,
    expectedOutput,
    slippage,
    maxAmount,
  }: SwapParams) =>
    ({
      name: 'exchange',
      network,
      pool,
      account,
      fromIndex,
      toIndex,
      inputAmount,
      decimals,
      expectedOutput,
      slippage,
      maxAmount,
    }) as const,
  queryFn: ({
    network,
    pool,
    account,
    fromIndex,
    toIndex,
    inputAmount,
    decimals,
    expectedOutput,
    slippage,
  }: SwapQuery) =>
    simulateContractCall<bigint>(
      network,
      pool,
      'exchange',
      [
        account,
        fromIndex,
        toIndex,
        BigInt(toWei(inputAmount, decimals[fromIndex])),
        BigInt(toWei(calculateMinimumReceived(expectedOutput, slippage, decimals[toIndex]), decimals[toIndex])),
        account,
      ],
      account,
    ),
  category: 'stellar.transaction',
  validationSuite: swapValidationSuite,
})
