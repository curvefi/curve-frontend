import { getRateCurve } from '@curvefi/prices-api/lending'
import type { RateCurve } from '@curvefi/prices-api/lending/models'
import { type FieldsOf } from '@ui-kit/lib'
import { ContractQuery, NoRetryError, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

type Query = ContractQuery
type QueryParams = FieldsOf<Query>

export const { useQuery: useRateCurve } = queryFactory({
  queryKey: ({ contractAddress, blockchainId }: QueryParams) =>
    [...rootKeys.contract({ contractAddress, blockchainId }), 'rateCurve', 'v1'] as const,
  queryFn: ({ blockchainId, contractAddress }: Query): Promise<RateCurve> =>
    NoRetryError.catch404(async () => await getRateCurve(blockchainId, contractAddress)),
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
