import { getSnapshots } from '@curvefi/prices-api/crvusd'
import type { Snapshot } from '@curvefi/prices-api/crvusd/models'
import type { FieldsOf } from '@ui-kit/lib'
import { ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import type { TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'

export type CrvUsdSnapshot = Snapshot
type Query = ContractQuery & { agg?: 'none' | 'day' | 'week'; timeOption?: TimeOption; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: (params: QueryParams) =>
    [
      ...rootKeys.contract(params),
      'crvUsd',
      'snapshots',
      'v2',
      { agg: params.agg },
      { timeOption: params.timeOption },
      { limit: params.limit },
    ] as const,
  queryFn: async ({ blockchainId, contractAddress, agg, timeOption, limit }: Query): Promise<CrvUsdSnapshot[]> => {
    const apiParams: Record<string, unknown> = { agg, fetch_on_chain: true }
    // Use limit for fixed row counts (e.g. 7-day averages), otherwise compute a date range
    // from timeOption to avoid backend timeouts from unbounded queries
    if (limit !== undefined) {
      apiParams.limit = limit
    } else {
      const resolvedTimeOption = timeOption ?? '1M'
      const now = Date.now()
      apiParams.start = Math.floor((now - TIME_OPTION_MS[resolvedTimeOption]) / 1000)
      apiParams.end = Math.floor(now / 1000)
    }
    return getSnapshots(blockchainId, contractAddress, apiParams as Parameters<typeof getSnapshots>[2])
  },
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
