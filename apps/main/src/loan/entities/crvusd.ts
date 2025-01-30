import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import { getSnapshots } from '@curvefi/prices-api/crvusd'
import { Chain } from '@curvefi/prices-api'
import type { Snapshot } from '@curvefi/prices-api/crvusd/models'

export type CrvUsdSnapshot = Snapshot

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'crvUsd', 'snapshots'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery): Promise<CrvUsdSnapshot[]> => {
    const snapshots = await getSnapshots(blockchainId as Chain, contractAddress)
    return snapshots.map((snapshot) => ({
      ...snapshot,
      rate: snapshot.rate * 100, // Convert to percentage for consistency with lending snapshots
    }))
  },
  staleTime: '10m',
  validationSuite: contractValidationSuite,
})
