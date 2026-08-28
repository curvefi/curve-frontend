import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import { requireVault, WithdrawParams, WithdrawQuery, withdrawValidationSuite } from '../validation/supply.validation'

const { useQuery: useWithdrawEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, withdrawAmount, isFull, userVaultShares }: WithdrawParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.withdraw',
      { withdrawAmount },
      { isFull },
      { userVaultShares },
    ] as const,
  queryFn: async ({ marketId, withdrawAmount, isFull, userVaultShares }: WithdrawQuery) =>
    await (isFull
      ? requireVault(marketId).vault.estimateGas.redeem(userVaultShares)
      : requireVault(marketId).vault.estimateGas.withdraw(withdrawAmount)),
  category: 'llamalend.supply',
  validationSuite: withdrawValidationSuite,
})

export const useWithdrawEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: WithdrawParams<ChainId>,
  enabled?: boolean,
) => useEstimateGas(networks, query.chainId, useWithdrawEstimateGasQuery(query, enabled), enabled)
