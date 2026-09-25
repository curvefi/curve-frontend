import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import { requireVault, UnstakeParams, UnstakeQuery, unstakeValidationSuite } from '../validation/supply.validation'

const { useQuery: useUnstakeEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, unstakeShares }: UnstakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.unstake', { unstakeShares }] as const,
  queryFn: async ({ marketId, unstakeShares }: UnstakeQuery) =>
    await requireVault(marketId).vault.estimateGas.unstake(unstakeShares),
  category: 'llamalend.supply',
  validationSuite: unstakeValidationSuite,
})

export const useUnstakeEstimateGas = createEstimateGasHook(useUnstakeEstimateGasQuery)
