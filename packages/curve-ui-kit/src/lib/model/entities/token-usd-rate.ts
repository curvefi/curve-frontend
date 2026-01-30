import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { getUsdPrice } from '@curvefi/prices-api/usd-price'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { getLib } from '@ui-kit/features/connect-wallet'
import { combineQueriesToObject, createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
import { tokenValidationGroup } from '@ui-kit/lib/model/query/token-validation'
import { BlockchainIds } from '@ui-kit/utils'

export const QUERY_KEY_IDENTIFIER = 'usdRate' as const

/**
 * Hook to fetch the USD rate for a specific token on a specific blockchain.
 * First attempts to use Curve/Llama APIs when available.
 * Falls back to the prices API if no matching library is available.
 */
export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  fetchQuery: fetchTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...rootKeys.token(params), QUERY_KEY_IDENTIFIER] as const,
  queryFn: async ({ chainId, tokenAddress }: TokenQuery) => {
    // First try the on-chain lib-based approach when available (uses prices API internally too)
    // Note that the libs return the number 0 when they fail
    const curve = getLib('curveApi')
    const curveRate = curve?.chainId === chainId && (await curve.getUsdRate(tokenAddress))
    if (curveRate) return curveRate

    const llama = getLib('llamaApi')
    const llamaRate = llama?.chainId === chainId && (await llama.getUsdRate(tokenAddress))
    if (llamaRate) return llamaRate

    // Fall back to prices API (works multi-chain without wallet connection or curve library)
    const blockchainId = BlockchainIds[chainId]
    if (!blockchainId) {
      throw new Error(`No blockchain ID mapping found for chain ID ${chainId}`)
    }
    const { usdPrice } = await getUsdPrice(blockchainId, tokenAddress as Address)
    return usdPrice
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite(({ chainId, tokenAddress }: TokenParams) => {
    tokenValidationGroup({ chainId, tokenAddress })
  }),
  disableLog: true, // too much noise in the logs
})

type UseTokenOptions = ReturnType<typeof getTokenUsdRateQueryOptions>

/** Hook to fetch USD rates for multiple tokens on a specific blockchain. */
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
