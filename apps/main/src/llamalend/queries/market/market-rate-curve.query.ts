import { getRateCurve, type RateCurve } from '@curvefi/prices-api/lending'
import type { ContractQuery } from '@evm-ui/queries/query-types'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import type { Address } from '@primitives/address.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'
import { q, type QueryProp } from '@ui/features/queries/util'
import { type FieldsOf } from '@ui/lib/validation/types'

type Query = ContractQuery
type QueryParams = FieldsOf<Query>

const { useQuery: useRateCurveQuery } = queryFactory({
  queryKey: ({ contractAddress, blockchainId }: QueryParams) =>
    ({ name: 'rateCurve', version: 1, blockchainId, contractAddress }) as const,
  queryFn: ({ blockchainId, contractAddress }: Query): Promise<RateCurve> =>
    NoRetryError.catch404(async () => await getRateCurve(blockchainId, contractAddress)),
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})

export const useRateCurve = ({
  blockchainId,
  controllerAddress,
}: Omit<QueryParams, 'contractAddress'> & { controllerAddress: QueryProp<Address> }) =>
  // the rate curve stays disabled until the controller address loads, so report its loading and error
  combineQueries(
    [q(useRateCurveQuery({ blockchainId, contractAddress: controllerAddress.data })), controllerAddress],
    rateCurve => rateCurve,
  )
