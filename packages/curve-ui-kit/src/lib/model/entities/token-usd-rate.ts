import { useCallback, useMemo } from 'react'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { combineQueriesToObject } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
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

type UseTokenOptions = ReturnType<typeof getTokenUsdRateQueryOptions>

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = useMemo(() => Array.from(new Set(tokenAddresses)), [tokenAddresses])
  return useQueries({
    queries: useMemo(
      (): UseTokenOptions[] =>
        uniqueAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
      [chainId, uniqueAddresses],
    ),
    combine: useCallback(
      (results: QueriesResults<UseTokenOptions[]>) => combineQueriesToObject(results, uniqueAddresses),
      [uniqueAddresses],
    ),
  })
}
