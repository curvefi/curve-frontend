import { getSnapshots } from '@curvefi/prices-api/crvusd'
import type { Snapshot } from '@curvefi/prices-api/crvusd/models'
import type { FieldsOf } from '@ui-kit/lib'
import { ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

export type CrvUsdSnapshot = Snapshot
type Query = ContractQuery & { agg?: 'none' | 'day' | 'week'; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: (params: QueryParams) =>
    [...rootKeys.contract(params), 'crvUsd', 'snapshots', 'v2', { agg: params.agg }, { limit: params.limit }] as const,
  queryFn: ({ blockchainId, contractAddress, agg, limit }: Query): Promise<CrvUsdSnapshot[]> =>
    getSnapshots(blockchainId, contractAddress, { agg, fetch_on_chain: true, limit }),
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
