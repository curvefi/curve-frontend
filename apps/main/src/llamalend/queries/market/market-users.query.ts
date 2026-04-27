import { Endpoint } from '@curvefi/prices-api/lending'
import { getMarketUsers } from '@curvefi/prices-api/llamalend'
import { type FieldsOf } from '@ui-kit/lib'
import { ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

type Query = ContractQuery & { endpoint: Endpoint }
type QueryParams = FieldsOf<Query>

export const { useQuery: useMarketUsers } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, endpoint }: QueryParams) =>
    [...rootKeys.contract({ blockchainId, contractAddress }), 'marketUsers', { endpoint }, 'v1'] as const,
  queryFn: ({ endpoint, blockchainId, contractAddress }: Query) =>
    getMarketUsers(endpoint, blockchainId, contractAddress),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
