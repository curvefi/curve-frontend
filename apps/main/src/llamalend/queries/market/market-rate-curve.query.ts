import { getRateCurve, type RateCurve } from '@curvefi/prices-api/lending'
import { ContractQuery, rootKeys } from '@evm-ui/lib/model/query'
import { contractValidationSuite } from '@evm-ui/lib/model/query/contract-validation'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'
import { type FieldsOf } from '@ui/lib/validation/types'

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
