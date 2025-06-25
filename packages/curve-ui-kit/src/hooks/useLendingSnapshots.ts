import { getSnapshots, Snapshot } from '@curvefi/prices-api/src/llamalend'
import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

type LendingSnapshotFromApi = Snapshot
export type LendingSnapshot = LendingSnapshotFromApi

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'lendingSnapshots', 'v1'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery): Promise<LendingSnapshot[]> => {
    // todo: pass {sort_by: 'DATE_ASC, start: now-week} and remove reverse (backend is timing out)
    const response = await getSnapshots(blockchainId, contractAddress, { agg: 'none', fetch_on_chain: false })
    return response.reverse()
  },
  staleTime: '1h',
  validationSuite: contractValidationSuite,
})
