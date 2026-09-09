import { getPoolMetadata, type GetPoolMetadataParams } from '@curvefi/prices-api/pools'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolMetadataParams = FieldsOf<GetPoolMetadataParams>

export const { useQuery: usePoolMetadata } = queryFactory({
  queryKey: ({ chain, poolAddress }: PoolMetadataParams) => ['pool-metadata', { chain }, { poolAddress }] as const,
  queryFn: async ({ chain, poolAddress }: GetPoolMetadataParams) => getPoolMetadata({ chain, poolAddress }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolMetadataParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.poolParams',
})
