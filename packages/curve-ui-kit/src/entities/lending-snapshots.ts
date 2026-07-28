import { getSnapshots, Snapshot } from '@curvefi/prices-api/llamalend'
import { type FieldsOf } from '@ui-kit/lib'
import { ContractQuery, NoRetryError, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import type { TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import { fetchDailySnapshotHistory } from './snapshot-history'

export type LendingSnapshot = Snapshot
type Query = ContractQuery & { timeOption?: TimeOption; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: ({ contractAddress, blockchainId, timeOption, limit }: QueryParams) =>
    [
      ...rootKeys.contract({ contractAddress, blockchainId }),
      'lendingSnapshots',
      'v5',
      { timeOption },
      { limit },
    ] as const,
  queryFn: async ({ blockchainId, contractAddress, timeOption = '1M', limit }: Query): Promise<LendingSnapshot[]> => {
    const now = Date.now()
    const response = await NoRetryError.catch404(async () =>
      limit
        ? getSnapshots(blockchainId, contractAddress, { agg: 'day', fetch_on_chain: true, limit })
        : fetchDailySnapshotHistory({
            range: {
              start: Math.floor((now - TIME_OPTION_MS[timeOption]) / 1000),
              end: Math.floor(now / 1000),
            },
            fetchOnChain: true,
            fetchSnapshots: (range, fetchOnChain) =>
              getSnapshots(blockchainId, contractAddress, {
                agg: 'day',
                fetch_on_chain: fetchOnChain,
                ...range,
              }),
          }),
    )
    return response.toReversed()
  },
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
