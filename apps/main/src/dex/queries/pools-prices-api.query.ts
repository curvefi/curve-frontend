import { isAddress, type Address } from 'viem'
import { getPools } from '@curvefi/prices-api/pools'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@evm-ui/lib/model'
import { pricesApiChainValidationSuite } from '@evm-ui/lib/model/query/prices-chain-validation'
import { mapQuery } from '@evm-ui/types/util'
import { fromEntries, maybe } from '@primitives/objects.utils'

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
