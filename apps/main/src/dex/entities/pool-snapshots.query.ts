import { useMemo } from 'react'
import { getPoolSnapshots, type GetPoolSnapshotsParams } from '@curvefi/prices-api/pools'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { TIME_FRAMES } from '@ui/lib/time'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolSnapshotsParams = FieldsOf<GetPoolSnapshotsParams>

const defaultStart = () => Math.floor((Date.now() - TIME_FRAMES.DAY_MS) / 1000)
const defaultEnd = () => Math.floor(Date.now() / 1000)

const { useQuery: usePoolSnapshotsQuery } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, start, end, unit }: PoolSnapshotsParams) =>
    ({ name: 'pool-snapshots', blockchainId, poolAddress, start, end, unit }) as const,
  queryFn: async ({ blockchainId, poolAddress, start, end, unit = 'none' }: GetPoolSnapshotsParams) =>
    getPoolSnapshots({ blockchainId, poolAddress, start, end, unit }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: PoolSnapshotsParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'dex.pools',
})

export function usePoolSnapshots({ start, end, ...params }: PoolSnapshotsParams, condition?: boolean) {
  const resolvedStart = useMemo(() => start ?? defaultStart(), [start])
  const resolvedEnd = useMemo(() => end ?? defaultEnd(), [end])
  return usePoolSnapshotsQuery({ ...params, start: resolvedStart, end: resolvedEnd }, condition)
}
