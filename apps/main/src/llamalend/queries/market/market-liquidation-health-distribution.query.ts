import { type Endpoint, getLiqHealthDeciles, type LiqHealthDeciles } from '@curvefi/prices-api/liquidations'
import { type FieldsOf } from '@ui-kit/lib'
import { ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

type Query = ContractQuery & { endpoint: Endpoint }
type QueryParams = FieldsOf<Query>

export const { useQuery: useMarketLiquidationHealthDistribution } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, endpoint }: QueryParams) =>
    [
      ...rootKeys.contract({ blockchainId, contractAddress }),
      'liquidationHealthDistribution',
      { endpoint },
      'v1',
    ] as const,
  queryFn: ({ endpoint, blockchainId, contractAddress }: Query): Promise<LiqHealthDeciles> =>
    getLiqHealthDeciles(endpoint, blockchainId, contractAddress),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
