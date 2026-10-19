import { type Address } from 'viem'
import { getPools } from '@curvefi/prices-api/pools'
import type { ChainNameParams, ChainNameQuery } from '@evm-ui/queries/query-types'
import { pricesApiChainValidationSuite } from '@evm-ui/queries/validation/prices-chain-validation'
import { fromEntries, maybe, type Nullish } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'

const { useQuery: usePoolsPricesApi } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) => ({ name: 'pools-prices-api', blockchainId }) as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => {
    const { pools } = await getPools(blockchainId)
    return fromEntries(pools.map(pool => [pool.address.toLocaleLowerCase(), pool]))
  },
  validationSuite: pricesApiChainValidationSuite,
  category: 'dex.pools',
})

export const usePoolPricesApi = (
  { blockchainId, poolAddress }: ChainNameParams & { poolAddress: Address | Nullish },
  enabled = true,
) =>
  mapQuery(usePoolsPricesApi({ blockchainId }, enabled), pools => maybe(poolAddress, addr => pools[addr.toLowerCase()]))
