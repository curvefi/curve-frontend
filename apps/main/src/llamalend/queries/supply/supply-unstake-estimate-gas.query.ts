import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import { requireVault, UnstakeParams, UnstakeQuery, unstakeValidationSuite } from '../validation/supply.validation'

const { useQuery: useUnstakeEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, unstakeShares }: UnstakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.unstake', { unstakeShares }] as const,
  queryFn: async ({ marketId, unstakeShares }: UnstakeQuery) =>
    await requireVault(marketId).vault.estimateGas.unstake(unstakeShares),
  category: 'llamalend.supply',
  validationSuite: unstakeValidationSuite,
})

export const useUnstakeEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: UnstakeParams<ChainId>,
  enabled?: boolean,
) => useEstimateGas(networks, query.chainId, useUnstakeEstimateGasQuery(query, enabled), enabled)
