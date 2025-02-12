import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import { getSupportedLendingChains } from '@/loan/entities/chains'
import { Chain } from '@curvefi/prices-api'
import { getSnapshots, Snapshot } from '@curvefi/prices-api/llamalend'

type LendingSnapshotFromApi = Snapshot
export type LendingSnapshot = LendingSnapshotFromApi

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'lendingSnapshots', 'v1'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery): Promise<LendingSnapshot[]> => {
    const chains = await getSupportedLendingChains()
    const chain = blockchainId as Chain
    if (!chains.includes(chain)) return [] // backend gives 404 for optimism

    // todo: pass {sort_by: 'DATE_ASC, start: now-week} and remove reverse (backend is timing out)
    const response = await getSnapshots(chain, contractAddress, { agg: 'none' })
    return response.reverse()
  },
  staleTime: '1h',
  validationSuite: contractValidationSuite,
})
