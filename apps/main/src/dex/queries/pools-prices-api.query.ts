import { getPools } from '@curvefi/prices-api/pools'
import { fromEntries } from '@primitives/objects.utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@ui-kit/lib/model'

export const { useQuery: usePoolsPricesApi } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) =>
    [...rootKeys.chainName({ blockchainId }), 'pools-prices-api'] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => {
    const { pools } = await getPools(blockchainId)
    return fromEntries(pools.map((pool) => [pool.address.toLocaleLowerCase(), pool]))
  },
  validationSuite: EmptyValidationSuite,
  category: 'dex.pools',
})
