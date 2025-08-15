import { Chain } from '@curvefi/prices-api'
import { getSnapshots } from '@curvefi/prices-api/crvusd'
import type { Snapshot } from '@curvefi/prices-api/crvusd/models'
import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

export type CrvUsdSnapshot = Snapshot

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'crvUsd', 'snapshots', 'v1'] as const,
  queryFn: ({ blockchainId, contractAddress }: ContractQuery): Promise<CrvUsdSnapshot[]> =>
    getSnapshots(blockchainId as Chain, contractAddress, { agg: 'none', fetch_on_chain: true }),
  staleTime: '10m',
  validationSuite: contractValidationSuite,
})
