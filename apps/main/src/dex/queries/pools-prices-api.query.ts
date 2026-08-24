import { isAddress, type Address } from 'viem'
import { getPools } from '@curvefi/prices-api/pools'
import { fromEntries, maybe } from '@primitives/objects.utils'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@ui-kit/lib/model'
import { pricesApiChainValidationSuite } from '@ui-kit/lib/model/query/prices-chain-validation'
import { mapQuery } from '@ui-kit/types/util'

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

export const usePoolPricesApi = ({
  blockchainId,
  poolAddress,
}: ChainNameParams & { poolAddress: string | undefined }) =>
  mapQuery(usePoolsPricesApi({ blockchainId }, isAddress(poolAddress as Address, { strict: false })), pools =>
    maybe(poolAddress, poolAddress => pools[poolAddress.toLowerCase()]),
  )
