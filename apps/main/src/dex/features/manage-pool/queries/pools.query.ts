import { getRefuelPools } from '@curvefi/prices-api/refuel'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@evm-ui/lib/model'
import { pricesApiChainValidationSuite } from '@evm-ui/lib/model/query/prices-chain-validation'
import { isAddressEqual, type Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'

const { useQuery: useRefuelPools } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) => [...rootKeys.chainName({ blockchainId }), 'getRefuelPools'] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => getRefuelPools(blockchainId),
  validationSuite: pricesApiChainValidationSuite,
  category: 'dex.pools',
})

type RefuelPoolParams = ChainNameParams & { poolAddress: Address | null | undefined }

export const useRefuelPool = ({ blockchainId, poolAddress }: RefuelPoolParams) =>
  mapQuery(useRefuelPools({ blockchainId }), data =>
    maybe(poolAddress, poolAddress => data.pools.find(pool => isAddressEqual(poolAddress, pool.address))),
  )
