import type { ChainNameQuery } from '@evm-ui/queries/query-types'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@evm-ui/queries/validation/prices-chain-validation'
import { findLpCoins } from '@evm-ui/utils/lp-token-coins'
import type { Address, Token } from '@primitives/address.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type TokenLpCoinsQuery = ChainNameQuery & { tokenAddress: Address }
type TokenLpCoinsParams = FieldsOf<TokenLpCoinsQuery>

/** The coins of a Curve LP token, or null when the token is not one */
export const { useQuery: useTokenLpCoins } = queryFactory({
  queryKey: ({ blockchainId, tokenAddress }: TokenLpCoinsParams) =>
    ({ name: 'token-lp-coins', blockchainId, tokenAddress }) as const,
  // TODO: fetch from the prices API token endpoint once it exists
  queryFn: ({ blockchainId, tokenAddress }: TokenLpCoinsQuery): Promise<Token[] | null> =>
    Promise.resolve(findLpCoins(blockchainId, tokenAddress) ?? null),
  validationSuite: createValidationSuite(({ blockchainId, tokenAddress }: TokenLpCoinsParams) => {
    pricesApiChainNameValidationGroup({ blockchainId })
    evmAddressValidationGroup({ evmAddress: tokenAddress, fieldName: 'tokenAddress' })
  }),
  category: 'llamalend.marketParams',
})
