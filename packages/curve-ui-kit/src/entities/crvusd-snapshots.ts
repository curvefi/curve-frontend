import { getSnapshots } from '@curvefi/prices-api/crvusd'
import type { Snapshot } from '@curvefi/prices-api/crvusd/models'
import type { FieldsOf } from '@ui-kit/lib'
import { ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import type { TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'

export type CrvUsdSnapshot = Snapshot
type Query = ContractQuery & { aggregate: 'day' | 'week'; timeOption?: TimeOption; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: ({ contractAddress, blockchainId, aggregate, timeOption = '1M', limit }: QueryParams) =>
    [
      ...rootKeys.contract({ contractAddress, blockchainId }),
      'crvUsd',
      'snapshots',
      'v2',
      { aggregate },
      { timeOption },
      { limit },
    ] as const,
  queryFn: async ({
    blockchainId,
    contractAddress,
    aggregate,
    timeOption = '1M',
    limit,
  }: Query): Promise<CrvUsdSnapshot[]> => {
    const now = Date.now()
    return await getSnapshots(blockchainId, contractAddress, {
      agg: aggregate,
      fetch_on_chain: true,
      // Use limit for fixed row counts (e.g. 7-day averages), otherwise compute a date range
      // from timeOption to avoid backend timeouts from unbounded queries
      ...(limit
        ? { limit }
        : { start: Math.floor((now - TIME_OPTION_MS[timeOption]) / 1000), end: Math.floor(now / 1000) }),
    })
  },
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
