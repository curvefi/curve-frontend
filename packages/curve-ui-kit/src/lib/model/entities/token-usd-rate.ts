import { useCallback, useMemo } from 'react'
import { enforce, group, test } from 'vest'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { getLib } from '@ui-kit/features/connect-wallet'
import { combineQueriesToObject, createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
import { tokenValidationGroup } from '@ui-kit/lib/model/query/token-validation'

export const QUERY_KEY_IDENTIFIER = 'usdRate' as const

/**
 * Hook to fetch the USD rate for a specific token on a specific blockchain.
 * Note this is limited to a single chain per time, since it's implemented using Curve and Llama APIs.
 * However, the libraries will cache the HTTP requests internally, so we don't need a HTTP request per token.
 * Note llamalend-js cannot be initialized without a wallet.
 * @see `useTokenUsdPrice` For multi-chain support.
 */
export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  fetchQuery: fetchTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...rootKeys.token(params), QUERY_KEY_IDENTIFIER] as const,
  queryFn: async ({ chainId, tokenAddress }: TokenQuery): Promise<number> => {
    const curve = getLib('curveApi')
    if (curve?.chainId === chainId) return await curve.getUsdRate(tokenAddress)
    const llama = getLib('llamaApi')
    if (llama?.chainId === chainId) return await llama.getUsdRate(tokenAddress)
    throw new Error('No matching API library found')
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite(({ chainId, tokenAddress }: TokenParams) => {
    tokenValidationGroup({ chainId, tokenAddress })
    group('apiValidation', () => {
      test('api', 'API chain ID mismatch', () => {
        enforce(getLib('llamaApi')?.chainId === chainId || getLib('curveApi')?.chainId === chainId)
          .isTruthy()
          .message(`No matching API library found for chain ID ${chainId}`)
      })
    })
  }),
  disableLog: true, // too much noise in the logs
})

type UseTokenOptions = ReturnType<typeof getTokenUsdRateQueryOptions>

/**
 * Hook to fetch USD rates for multiple tokens on a specific blockchain.
 * Note this is limited to a single chain per time, since it's implemented using Curve and Llama APIs.
 */
export const useTokenUsdRates = (
  { chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] },
  enabled: boolean = true,
) => {
  const uniqueAddresses = useMemo(() => Array.from(new Set(tokenAddresses)), [tokenAddresses])
  return useQueries({
    queries: useMemo(
      (): UseTokenOptions[] =>
        uniqueAddresses.map((tokenAddress) => ({
          ...getTokenUsdRateQueryOptions({ chainId, tokenAddress }),
          enabled,
        })),
      [chainId, uniqueAddresses, enabled],
    ),
    combine: useCallback(
      (results: QueriesResults<UseTokenOptions[]>) => combineQueriesToObject(results, uniqueAddresses),
      [uniqueAddresses],
    ),
  })
}
