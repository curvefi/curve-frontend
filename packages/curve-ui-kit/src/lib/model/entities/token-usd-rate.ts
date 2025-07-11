import { useEffect, useState } from 'react'
import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { useQueryMapping } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from '@ui-kit/lib/model/query/token-validation'

const QUERY_KEY_IDENTIFIER = 'usdRate' as const

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  fetchQuery: fetchTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), QUERY_KEY_IDENTIFIER] as const,
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

/** Check if it's a token price query by looking for QUERY_KEY_IDENTIFIER as the last element */
const isTokenUsdRateQuery = ({ queryKey }: { queryKey: readonly unknown[] }) =>
  queryKey?.at(-1) === QUERY_KEY_IDENTIFIER

export const invalidateAllTokenPrices = () => queryClient.invalidateQueries({ predicate: isTokenUsdRateQuery })

/**
 * Retrieves all cached token USD rates from the query cache and returns them as a record.
 *
 * Iterates through all queries matching the token USD rate predicate, extracts the token
 * address from the query key structure, and maps it to the cached rate data.
 *
 * @returns Record<string, number> - Map of token addresses to their USD rates,
 *                                   filtered to only include valid entries with numeric data
 */
const getAllTokenUsdRatesAsRecord = (): Record<string, number> =>
  Object.fromEntries(
    queryClient
      .getQueryCache()
      .findAll({ predicate: isTokenUsdRateQuery })
      .map(({ queryKey, state }) => {
        // Extract tokenAddress from queryKey structure
        const { tokenAddress } =
          queryKey.find(
            (item): item is { tokenAddress: string } =>
              typeof item === 'object' && item !== null && 'tokenAddress' in item,
          ) ?? {}

        return [tokenAddress, state.data] as const
      })
      .filter(([tokenAddress, data]) => tokenAddress && typeof data === 'number'),
  )

/**
 * Hook that provides real-time access to all cached token USD rates.
 *
 * Subscribes to query cache changes and automatically updates when token price
 * data is modified. Returns a record mapping token addresses to their USD rates.
 *
 * @remarks Considered using useSyncExternalStore, but that requires a stable object reference.
 *          It's either useRef + useSyncExternalStore or useState + useEffect.
 *          Docs also say that "When possible, we recommend using built-in React state with
 *          useState and useReducer instead. The useSyncExternalStore API is mostly useful
 *          if you need to integrate with existing non-React code."
 * @returns Record<string, number> - Map of token addresses to their current USD rates
 */
export const useAllTokenUsdRates = () => {
  const [rates, setRates] = useState<Record<string, number>>({})

  useEffect(() => {
    const updateRates = () => setRates(getAllTokenUsdRatesAsRecord())
    updateRates()

    return queryClient.getQueryCache().subscribe(({ query }) => {
      if (isTokenUsdRateQuery(query)) {
        updateRates()
      }
    })
  }, [])

  return rates
}
