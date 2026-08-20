import { useMemo } from 'react'
import { getPoolSnapshots, type GetPoolSnapshotsParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model/query'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { TIME_FRAMES } from '@evm-ui/utils'

type PoolSnapshotsParams = FieldsOf<GetPoolSnapshotsParams>

const defaultStart = () => Math.floor((Date.now() - TIME_FRAMES.DAY_MS) / 1000)
const defaultEnd = () => Math.floor(Date.now() / 1000)

const { useQuery: usePoolSnapshotsQuery } = queryFactory({
  queryKey: ({ chain, poolAddress, start, end, unit }: PoolSnapshotsParams) =>
    ['pool-snapshots', { chain }, { poolAddress }, { start }, { end }, { unit }] as const,
  queryFn: async ({ chain, poolAddress, start, end, unit = 'none' }: GetPoolSnapshotsParams) =>
    getPoolSnapshots({ chain, poolAddress, start, end, unit }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolSnapshotsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.pools',
})

export function usePoolSnapshots({ start, end, ...params }: PoolSnapshotsParams, condition?: boolean) {
  const resolvedStart = useMemo(() => start ?? defaultStart(), [start])
  const resolvedEnd = useMemo(() => end ?? defaultEnd(), [end])
  return usePoolSnapshotsQuery({ ...params, start: resolvedStart, end: resolvedEnd }, condition)
}
