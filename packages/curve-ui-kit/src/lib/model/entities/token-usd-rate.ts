import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { useQueryMapping } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from '@ui-kit/lib/model/query/token-validation'

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  fetchQuery: fetchTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: ({ tokenAddress }: TokenQuery): Promise<number> =>
    getLib('curveApi')?.getUsdRate(tokenAddress) ?? requireLib('llamaApi').getUsdRate(tokenAddress),
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))
  return useQueryMapping(
    uniqueAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    uniqueAddresses,
  )
}

export const invalidateAllTokenPrices = () =>
  queryClient.invalidateQueries({
    // Check if it's a token price query by looking for 'usdRate' as the last element
    predicate: ({ queryKey }) => queryKey?.at(-1) === 'usdRate',
  })

export const getAllTokenUsdRatesAsRecord = (): Record<string, number> => {
  const cache = queryClient.getQueryCache()
  const result: Record<string, number> = {}

  cache.getAll().forEach(({ queryKey, state }) => {
    if (queryKey?.at(-1) === 'usdRate' && state.data !== undefined) {
      // Extract tokenAddress from queryKey structure
      const tokenAddress = (
        queryKey.find((item) => typeof item === 'object' && item !== null && 'tokenAddress' in item) as {
          tokenAddress: string
        }
      )?.tokenAddress

      if (tokenAddress && typeof state.data === 'number') {
        result[tokenAddress] = state.data
      }
    }
  })

  return result
}
