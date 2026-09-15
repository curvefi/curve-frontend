import { rootKeys, type ChainParams, type ChainQuery } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { addQueryString, fetchJson } from '@primitives/fetch.utils'
import { mapRecord, objectKeys } from '@primitives/objects.utils'
import type { TokensResponse } from '@primitives/tokens'
import { queryFactory } from '@ui/features/queries/factory'
import { useMappedQuery } from '@ui/features/queries/util'
import { createValidationSuite } from '@ui/lib/validation/lib'

const { useQuery: useTokensQuery, invalidate: invalidateTokens } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'tokens'] as const,
  queryFn: ({ chainId }: ChainQuery) => fetchJson<TokensResponse>(`/api/router/v1/tokens${addQueryString({ chainId })}`),
  validationSuite: createValidationSuite(chainValidationGroup),
  category: 'dex.pools',
})

export { invalidateTokens }

const selectTokens = (tokens: TokensResponse) => ({
  tokens,
  tokensMapperStr: objectKeys(tokens).reduce((str, address) => str + address.charAt(5), ''),
})

type TokensData = ReturnType<typeof selectTokens>
type TokensParams = { chainId: ChainParams['chainId'] }

const selectTokenNames = ({ tokens }: TokensData) => mapRecord(tokens, (_, token) => token.name)
const selectTokenAddresses = ({ tokens }: TokensData) => objectKeys(tokens)

/** The chain's token catalog, available independently of wallet connection and DEX hydration. */
export const useTokens = (params: TokensParams) => useMappedQuery(useTokensQuery(params), selectTokens)

export const useTokenNames = (params: TokensParams) => useMappedQuery(useTokens(params), selectTokenNames)

export const useTokenAddresses = (params: TokensParams) => useMappedQuery(useTokens(params), selectTokenAddresses)
