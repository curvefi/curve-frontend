import { useCallback } from 'react'
import { getAddress, isAddress, type Address } from 'viem'
import { rootKeys, type ChainParams, type ChainQuery } from '@evm-ui/queries/root-keys'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { addQueryString, fetchJson } from '@primitives/fetch.utils'
import { maybe } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { useMappedQuery } from '@ui/features/queries/util'
import { createValidationSuite } from '@ui/lib/validation/lib'

type TokenMetadata = { decimals: number; symbol: string; lp?: true; volume?: number }

/** Token metadata keyed by checksummed addresses. */
export type TokenMapper = Record<Address, TokenMetadata>

export const { useQuery: useTokens } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'tokens'] as const,
  queryFn: ({ chainId }: ChainQuery) => fetchJson<TokenMapper>(`/api/router/v1/tokens${addQueryString({ chainId })}`),
  validationSuite: createValidationSuite(chainValidationGroup),
  category: 'dex.pools',
})

/** Look up token data from potentially unsanitized input. */
export const getToken = (tokens: TokenMapper | undefined, tokenAddress: string | undefined) => {
  if (!tokenAddress || !isAddress(tokenAddress, { strict: false })) return undefined
  const address = getAddress(tokenAddress)
  return maybe(tokens?.[address], token => ({ ...token, address }))
}

export const useToken = ({ chainId, tokenAddress }: ChainParams & { tokenAddress: string | undefined }) => {
  const enabled = !!chainId && !!tokenAddress && isAddress(tokenAddress, { strict: false })
  const { data, error, isLoading } = useTokens({ chainId }, enabled)

  return useMappedQuery(
    { data, error, isLoading: enabled && isLoading },
    useCallback(tokens => getToken(tokens, tokenAddress), [tokenAddress]),
  )
}
