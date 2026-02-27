import { getSnapshots, Snapshot } from '@curvefi/prices-api/llamalend'
import type { FieldsOf } from '@ui-kit/lib'
import { ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

type LendingSnapshotFromApi = Snapshot
export type LendingSnapshot = LendingSnapshotFromApi
type Query = ContractQuery & { agg?: 'none' | 'day' | 'week'; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: (params: QueryParams) =>
    [...rootKeys.contract(params), 'lendingSnapshots', 'v4', { agg: params.agg }, { limit: params.limit }] as const,
  queryFn: async ({ blockchainId, contractAddress, agg, limit }: Query): Promise<LendingSnapshot[]> => {
    // todo: pass {sort_by: 'DATE_ASC, start: now-week} and remove reverse (backend is timing out)
    const response = await getSnapshots(blockchainId, contractAddress, { agg, fetch_on_chain: true, limit })
    return response.reverse()
  },
  validationSuite: contractValidationSuite,
  category: 'table',
})
