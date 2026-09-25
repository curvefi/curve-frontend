import { getSnapshots, Snapshot } from '@curvefi/prices-api/llamalend'
import { ContractQuery, rootKeys } from '@evm-ui/queries/root-keys'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import type { TimeOption } from '@evm-ui/queries/validation/time-option-validation'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'
import { TIME_OPTION_MS } from '@ui/lib/time'
import { type FieldsOf } from '@ui/lib/validation/types'
import { fetchDailySnapshotHistory } from './time-series-history.query'

export type LendingSnapshot = Snapshot
type Query = ContractQuery & { timeOption?: TimeOption; limit?: number }
type QueryParams = FieldsOf<Query>

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: ({ contractAddress, blockchainId, timeOption = '1M', limit }: QueryParams) =>
    [
      rootKeys.contract({ contractAddress, blockchainId }),
      { name: 'lendingSnapshots', version: 'v5', timeOption, limit },
    ] as const,
  queryFn: async ({ blockchainId, contractAddress, timeOption = '1M', limit }: Query): Promise<LendingSnapshot[]> => {
    const now = Date.now()
    const response = await NoRetryError.catch404(async () =>
      // A limit requests the latest snapshots directly; otherwise fetch the full selected range in chunks.
      limit
        ? getSnapshots(blockchainId, contractAddress, { agg: 'day', fetch_on_chain: true, limit })
        : fetchDailySnapshotHistory({
            range: { start: Math.floor((now - TIME_OPTION_MS[timeOption]) / 1000), end: Math.floor(now / 1000) },
            fetchSnapshots: (range, fetchOnChain) =>
              getSnapshots(blockchainId, contractAddress, { agg: 'day', fetch_on_chain: fetchOnChain, ...range }),
          }),
    )
    return response.toReversed()
  },
  validationSuite: contractValidationSuite,
  category: 'global.snapshots',
})
