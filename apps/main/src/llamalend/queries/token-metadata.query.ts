import { getToken } from '@curvefi/prices-api/tokens'
import type { ChainNameQuery } from '@evm-ui/queries/query-types'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@evm-ui/queries/validation/prices-chain-validation'
import type { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

/** The metadata of a token, with the coins and the pool of LP tokens */
export const { useQuery: useTokenMetadata, fetchQuery: fetchTokenMetadata } = queryFactory({
  queryKey: ({ blockchainId, tokenAddress }: FieldsOf<ChainNameQuery & { tokenAddress: Address }>) =>
    ({
      name: 'token-metadata',
      blockchainId,
      // the market list and llamalend-js use different cases for the same address
      tokenAddress: tokenAddress?.toLowerCase() as Address | undefined,
    }) as const,
  queryFn: ({ blockchainId, tokenAddress }: ChainNameQuery & { tokenAddress: Address }) =>
    getToken(blockchainId, tokenAddress),
  validationSuite: createValidationSuite(
    ({ blockchainId, tokenAddress }: FieldsOf<ChainNameQuery & { tokenAddress: Address }>) => {
      pricesApiChainNameValidationGroup({ blockchainId })
      evmAddressValidationGroup({ evmAddress: tokenAddress, fieldName: 'tokenAddress' })
    },
  ),
  category: 'llamalend.marketParams',
})
