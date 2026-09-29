import { getPoolMetadata, type GetPoolMetadataParams } from '@curvefi/prices-api/pools'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolMetadataParams = FieldsOf<GetPoolMetadataParams>

export const { useQuery: usePoolMetadata } = queryFactory({
  queryKey: ({ blockchainId, poolAddress }: PoolMetadataParams) =>
    ({ name: 'pool-metadata', blockchainId, poolAddress }) as const,
  queryFn: async ({ blockchainId, poolAddress }: GetPoolMetadataParams) => getPoolMetadata({ blockchainId, poolAddress }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: PoolMetadataParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'dex.poolParams',
})
