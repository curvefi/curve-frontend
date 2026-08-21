import { getPools } from '@curvefi/prices-api/pools'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@evm-ui/lib/model'
import { pricesApiChainValidationSuite } from '@evm-ui/lib/model/query/prices-chain-validation'
import { fromEntries } from '@primitives/objects.utils'

export const { useQuery: usePoolsPricesApi } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) =>
    [...rootKeys.chainName({ blockchainId }), 'pools-prices-api'] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => {
    const { pools } = await getPools(blockchainId)
    return fromEntries(pools.map(pool => [pool.address.toLocaleLowerCase(), pool]))
  },
  validationSuite: pricesApiChainValidationSuite,
  category: 'dex.pools',
})
