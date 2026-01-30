import { useCallback, useMemo } from 'react'
import { formatEther, isAddressEqual, type Address } from 'viem'
import { FetchError } from '@curvefi/prices-api/fetch'
import { getUsdPrice } from '@curvefi/prices-api/usd-price'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { getLib } from '@ui-kit/features/connect-wallet'
import type { LibKey } from '@ui-kit/features/connect-wallet/lib/types'
import { getWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { combineQueriesToObject, createValidationSuite } from '@ui-kit/lib'
import {
  NoRetryError,
  queryFactory,
  rootKeys,
  type ChainParams,
  type TokenParams,
  type TokenQuery,
} from '@ui-kit/lib/model/query'
import { tokenValidationGroup } from '@ui-kit/lib/model/query/token-validation'
import { BlockchainIds, REUSD_ADDRESS, SREUSD_ADDRESS } from '@ui-kit/utils'
import { readContract } from '@wagmi/core'

export const QUERY_KEY_IDENTIFIER = 'usdRate' as const

/** Try Curve/Llama API (returns null on failure) */
const fetchFromCurveLib = async (libName: LibKey, chainId: number, tokenAddress: string): Promise<number | null> => {
  const lib = getLib(libName)
  const rate = lib?.chainId === chainId && (await lib.getUsdRate(tokenAddress)) // failures by lib return a 0 value
  return rate || null
}

/** Try prices API (returns null on failure) */
const fetchFromPricesApi = async (chainId: number, tokenAddress: string) => {
  const blockchainId = BlockchainIds[chainId]
  if (!blockchainId) return null

  try {
    const { usdPrice } = await getUsdPrice(blockchainId, tokenAddress as Address)
    return usdPrice || null
  } catch (error) {
    // Only swallow 404 errors (token not found), rethrow other issues for retries
    if (error instanceof FetchError && error.status === 404) {
      return null
    }
    throw error
  }
}

/** Fallback for sreusd - derives price from reusd and the sreusd price per share */
const fetchFallbackSreUsd = async (chainId: number, tokenAddress: string): Promise<number | null> => {
  if (!isAddressEqual(tokenAddress as Address, SREUSD_ADDRESS)) return null

  // Fetch reusd price using the normal token rate fetcher, hopefully that won't fail too!
  const reusdPrice = await fetchTokenUsdRate({ chainId, tokenAddress: REUSD_ADDRESS })

  // Calculate sreusd price based on reusd and exchange rate
  const config = getWagmiConfig()
  if (!config) return null

  const exchangeRate = await readContract(config!, {
    address: SREUSD_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'pricePerShare',
        outputs: [
          {
            internalType: 'uint256',
            name: '_pricePerShare',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'pricePerShare',
    chainId,
  })

  return reusdPrice * +formatEther(exchangeRate)
}

/** Main fetcher that tries all sources in order */
const fetchUsdRate = async (chainId: number, tokenAddress: string) => {
  const rate =
    (await fetchFromCurveLib('curveApi', chainId, tokenAddress)) ??
    (await fetchFromCurveLib('llamaApi', chainId, tokenAddress)) ??
    (await fetchFromPricesApi(chainId, tokenAddress)) ??
    (await fetchFallbackSreUsd(chainId, tokenAddress))

  // Don't bother with retries if we've exchausted all options (and each option didn't unexpectedly fail)
  if (rate === null) {
    throw new NoRetryError(`Failed to fetch USD rate for token ${tokenAddress} on chain ${chainId}`)
  }

  return rate
}

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
  queryFn: async ({ chainId, tokenAddress }: TokenQuery) => await fetchUsdRate(chainId, tokenAddress),
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
