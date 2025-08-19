import { Chain } from '@curvefi/prices-api'
import { getSnapshots } from '@curvefi/prices-api/crvusd'
import type { Snapshot } from '@curvefi/prices-api/crvusd/models'
import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

export type CrvUsdSnapshot = Snapshot
type QueryParams = ContractParams & { agg?: 'none' | 'day' | 'week'; limit?: number }
type Query = ContractQuery & { agg?: 'none' | 'day' | 'week'; limit?: number }

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: (params: QueryParams) => [...rootKeys.contract(params), 'crvUsd', 'snapshots', 'v2'] as const,
  queryFn: ({ blockchainId, contractAddress, agg, limit }: Query): Promise<CrvUsdSnapshot[]> =>
    getSnapshots(blockchainId as Chain, contractAddress, { agg, fetch_on_chain: true, limit }),
  staleTime: '10m',
  validationSuite: contractValidationSuite,
})
