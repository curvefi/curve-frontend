import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { combineQueriesToObject } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import {
  extractTokenAddress,
  queryFactory,
  rootKeys,
  type ChainParams,
  type TokenParams,
  type TokenQuery,
} from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from '@ui-kit/lib/model/query/token-validation'

const QUERY_KEY_IDENTIFIER = 'usdRate' as const

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  fetchQuery: fetchTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...rootKeys.token(params), QUERY_KEY_IDENTIFIER] as const,
  queryFn: ({ tokenAddress }: TokenQuery): Promise<number> =>
    getLib('curveApi')?.getUsdRate(tokenAddress) ?? requireLib('llamaApi').getUsdRate(tokenAddress),
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))

  return useQueries({
    queries: uniqueAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    combine: (results) => combineQueriesToObject(results, uniqueAddresses),
  })
}

/** Check if it's a token price query by looking for QUERY_KEY_IDENTIFIER as the last element */
const isTokenUsdRateQuery = ({ queryKey }: { queryKey: readonly unknown[] }) =>
  queryKey?.at(-1) === QUERY_KEY_IDENTIFIER

export const invalidateAllTokenPrices = () => queryClient.invalidateQueries({ predicate: isTokenUsdRateQuery })

/** Retrieves all cached values and returns them as a record */
const getAllTokenUsdRates = (): Record<string, number> =>
  Object.fromEntries(
    queryClient
      .getQueryCache()
      .findAll({ predicate: isTokenUsdRateQuery })
      .map(({ queryKey, state }) => [extractTokenAddress(queryKey), state.data] as const)
      .filter(([tokenAddress, data]) => tokenAddress && typeof data === 'number'),
  )

/** Hook that provides real-time access to all cached values as a record. */
export const useAllTokenUsdRates = () => {
  const [rates, setRates] = useState<Record<string, number>>({})

  useEffect(() => {
    const updateRates = () => setRates(getAllTokenUsdRates())
    updateRates()

    return queryClient.getQueryCache().subscribe(({ query }) => {
      if (isTokenUsdRateQuery(query)) {
        updateRates()
      }
    })
  }, [])

  return rates
}
