import { getPoolMetadata, type GetPoolMetadataParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

type PoolMetadataParams = FieldsOf<GetPoolMetadataParams>

export const { useQuery: usePoolMetadata } = queryFactory({
  queryKey: ({ chain, poolAddress }: PoolMetadataParams) => ['pool-metadata', { chain }, { poolAddress }] as const,
  queryFn: async ({ chain, poolAddress }: GetPoolMetadataParams) => getPoolMetadata({ chain, poolAddress }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolMetadataParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.poolParams',
})
