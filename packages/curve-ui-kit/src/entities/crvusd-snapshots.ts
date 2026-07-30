import { getSnapshots, type Snapshot } from '@curvefi/prices-api/crvusd'
import { type FieldsOf } from '@ui-kit/lib'
import { ContractQuery, NoRetryError, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import type { TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import { fetchDailySnapshotHistory } from './time-series-history'

export type CrvUsdSnapshot = Snapshot
type Query = ContractQuery & { timeOption?: TimeOption; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: ({ contractAddress, blockchainId, timeOption = '1M', limit }: QueryParams) =>
    [
      ...rootKeys.contract({ contractAddress, blockchainId }),
      'crvUsd',
      'snapshots',
      'v3',
      { timeOption },
      { limit },
    ] as const,
  queryFn: ({ blockchainId, contractAddress, timeOption = '1M', limit }: Query): Promise<CrvUsdSnapshot[]> => {
    const now = Date.now()
    return NoRetryError.catch404(async () =>
      // A limit requests the latest snapshots directly; otherwise fetch the full selected range in chunks.
      limit
        ? getSnapshots(blockchainId, contractAddress, { agg: 'day', fetch_on_chain: true, limit })
        : fetchDailySnapshotHistory({
            range: {
              start: Math.floor((now - TIME_OPTION_MS[timeOption]) / 1000),
              end: Math.floor(now / 1000),
            },
            fetchSnapshots: (range, fetchOnChain) =>
              getSnapshots(blockchainId, contractAddress, {
                agg: 'day',
                fetch_on_chain: fetchOnChain,
                ...range,
              }),
          }),
    )
  },
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
