import { isAddressEqual } from 'viem'
import { getRefuelPools } from '@curvefi/prices-api/refuel'
import type { Address } from '@primitives/address.utils'
import { queryFactory, rootKeys, type ChainNameParams, type ChainNameQuery } from '@ui-kit/lib/model'
import { pricesApiChainValidationSuite } from '@ui-kit/lib/model/query/prices-chain-validation'
import { mapQuery } from '@ui-kit/types/util'

const { useQuery: useRefuelPools } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) => [...rootKeys.chainName({ blockchainId }), 'getRefuelPools'] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => getRefuelPools(blockchainId),
  validationSuite: pricesApiChainValidationSuite,
  category: 'dex.pools',
})

type RefuelPoolParams = ChainNameParams & { poolAddress: Address | null | undefined }

export const useRefuelPool = ({ blockchainId, poolAddress }: RefuelPoolParams) =>
  mapQuery(
    useRefuelPools({ blockchainId }),
    data => poolAddress && data.pools.find(pool => isAddressEqual(poolAddress, pool.address)),
  )
