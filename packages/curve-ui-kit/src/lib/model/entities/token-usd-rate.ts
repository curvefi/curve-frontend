import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { FetchError } from '@curvefi/prices-api/fetch'
import { fromEntries, recordEntries } from '@curvefi/prices-api/objects.util'
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
  queryFn: async ({ chainId, tokenAddress }: TokenQuery): Promise<number | null> => {
    // First try the on-chain lib-based approach when available (uses prices API internally too)
    const curve = getLib('curveApi')
    if (curve?.chainId === chainId) return await curve.getUsdRate(tokenAddress)
    const llama = getLib('llamaApi')
    if (llama?.chainId === chainId) return await llama.getUsdRate(tokenAddress)

    // Fall back to prices API (works multi-chain without wallet connection or curve library)
    const blockchainId = BlockchainIds[chainId]
    if (!blockchainId) {
      throw new Error(`No blockchain ID mapping found for chain ID ${chainId}`)
    }
    try {
      const { usdPrice } = await getUsdPrice(blockchainId, tokenAddress as Address)
      return usdPrice
    } catch (e) {
      if (e instanceof FetchError && e.status === 404) {
        return null // do not retry 404 errors from the prices API
      }
      throw e
    }
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
      (results: QueriesResults<UseTokenOptions[]>) => {
        const combined = combineQueriesToObject(results, uniqueAddresses)
        return {
          ...combined,
          data: fromEntries(
            recordEntries(combined.data).filter((entry): entry is [string, number] => entry[1] != null),
          ),
        }
      },
      [uniqueAddresses],
    ),
  })
}
