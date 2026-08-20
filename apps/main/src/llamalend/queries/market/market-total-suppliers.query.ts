import { getVaultDepositors } from '@curvefi/prices-api/llamalend'
import { queryFactory, rootKeys } from '@evm-ui/lib/model/query'
import { contractValidationSuite } from '@evm-ui/lib/model/query/contract-validation'
import type { ContractParams, ContractQuery } from '@evm-ui/lib/model/query/root-keys'

export const { useQuery: useMarketTotalSuppliers } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'totalSuppliers', 'v1'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery) =>
    (await getVaultDepositors(blockchainId, contractAddress)).totalSuppliers,
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
