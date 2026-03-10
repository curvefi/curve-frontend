import { getPoolSnapshots, type GetPoolSnapshotsParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

type PoolSnapshotsParams = FieldsOf<GetPoolSnapshotsParams>

export const { useQuery: usePoolSnapshots } = queryFactory({
  queryKey: ({ chain, poolAddress, start, end, unit }: PoolSnapshotsParams) =>
    ['pool-snapshots', { chain }, { poolAddress }, { start }, { end }, { unit }] as const,
  queryFn: async ({
    chain,
    poolAddress,
    start = Math.floor((Date.now() - TIME_FRAMES.DAY_MS) / 1000),
    end = Math.floor(Date.now() / 1000),
    unit = 'none',
  }: GetPoolSnapshotsParams) => getPoolSnapshots({ chain, poolAddress, start, end, unit }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolSnapshotsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.pools',
})
