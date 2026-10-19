import { getPools } from '@curvefi/prices-api/pools'
import type { ChainNameParams, ChainNameQuery } from '@evm-ui/queries/query-types'
import { pricesApiChainValidationSuite } from '@evm-ui/queries/validation/prices-chain-validation'
import type { Address } from '@primitives/address.utils'
import { fromEntries } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'

export const { useQuery: useLpTokenPools, fetchQuery: fetchLpTokenPools } = queryFactory({
  queryKey: ({ blockchainId }: ChainNameParams) => ({ name: 'lp-token-pools', blockchainId }) as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => {
    const { pools } = await getPools(blockchainId)
    return fromEntries(pools.map(({ lpTokenAddress, address }) => [lpTokenAddress.toLowerCase(), address]))
  },
  validationSuite: pricesApiChainValidationSuite,
  category: 'dex.pools',
})

/** Returns the address of the Curve pool whose LP token is the given token, or null when the token is not a Curve LP token */
export const useLpTokenPool = (
  { blockchainId, tokenAddress }: ChainNameParams & { tokenAddress: Address | undefined },
  enabled = true,
) =>
  mapQuery(
    useLpTokenPools({ blockchainId }, enabled && !!tokenAddress),
    (pools): Address | null => (tokenAddress && pools[tokenAddress.toLowerCase()]) || null,
  )
