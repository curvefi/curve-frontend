import { getRateCurve, type RateCurve } from '@curvefi/prices-api/lending'
import type { ContractQuery } from '@evm-ui/queries/query-types'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'
import { type FieldsOf } from '@ui/lib/validation/types'

type Query = ContractQuery
type QueryParams = FieldsOf<Query>

export const { useQuery: useRateCurve } = queryFactory({
  queryKey: ({ contractAddress, blockchainId }: QueryParams) => ({
    name: 'rateCurve',
    version: 1,
    blockchainId,
    contractAddress,
  }),
  queryFn: ({ blockchainId, contractAddress }: Query): Promise<RateCurve> =>
    NoRetryError.catch404(async () => await getRateCurve(blockchainId, contractAddress)),
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
