import { getPoolMetadata, type GetPoolMetadataParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model/query'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'

type PoolMetadataParams = FieldsOf<GetPoolMetadataParams>

export const { useQuery: usePoolMetadata } = queryFactory({
  queryKey: ({ chain, poolAddress }: PoolMetadataParams) => ['pool-metadata', { chain }, { poolAddress }] as const,
  queryFn: async ({ chain, poolAddress }: GetPoolMetadataParams) => getPoolMetadata({ chain, poolAddress }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolMetadataParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.poolParams',
})
