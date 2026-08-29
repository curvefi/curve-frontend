import { getRateCurve, type RateCurve } from '@curvefi/prices-api/lending'
import { type FieldsOf } from '@evm-ui/lib'
import { ContractQuery, NoRetryError, queryFactory, rootKeys } from '@evm-ui/lib/model/query'
import { contractValidationSuite } from '@evm-ui/lib/model/query/contract-validation'

type Query = ContractQuery
type QueryParams = FieldsOf<Query>

export const { useQuery: useRateCurve } = queryFactory({
  queryKey: ({ contractAddress, blockchainId }: QueryParams) =>
    [...rootKeys.contract({ contractAddress, blockchainId }), 'rateCurve', 'v2'] as const,
  queryFn: ({ blockchainId, contractAddress }: Query): Promise<RateCurve> =>
    NoRetryError.catch404(async () => await getRateCurve(blockchainId, contractAddress)),
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
