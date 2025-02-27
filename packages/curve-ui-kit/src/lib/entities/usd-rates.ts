import { useQueries, useQuery, type QueryClient, queryOptions } from '@tanstack/react-query'
import PromisePool from '@supercharge/promise-pool'

export type UsdRatesMapper = { [tokenAddress: string]: number | undefined }

const QUERY_KEY = 'usdRates' as const

/** Function type for fetching USD rate for a token */
type GetUsdRate = ((coin: string) => Promise<number>) | undefined

/** Generates a query key for a specific token address */
function getKey(tokenAddress: string) {
  return [QUERY_KEY, tokenAddress] as const
}

/**
 * Core fetching logic without cache checking
 * Returns NaN if token address is empty or fetch fails
 */
export async function queryFn(getUsdRate: GetUsdRate, tokenAddress: string): Promise<number> {
  return tokenAddress && getUsdRate ? getUsdRate(tokenAddress).catch(() => NaN) : Promise.resolve(NaN)
}

/**
 * Fetches USD rate for a single token with cache support. Usable outside React.
 * @param queryClient - React Query client
 * @param getUsdRate - Function to fetch USD rate
 * @param tokenAddress - Token address to get rate for
 * @param shouldRefetch - Force refetch even if cached
 * @returns Promise resolving to USD rate
 */
export async function fetchUsdRate(
  queryClient: QueryClient,
  getUsdRate: GetUsdRate,
  tokenAddress: string,
  shouldRefetch = false,
) {
  if (shouldRefetch) {
    queryClient.removeQueries({ queryKey: getKey(tokenAddress) })
  }

  return queryClient.fetchQuery(createQueryOptions(getUsdRate, tokenAddress))
}

/**
 * Batch fetch multiple tokens with caching and concurrency control
 * @param queryClient - React Query client
 * @param getUsdRate - Function to fetch USD rate
 * @param tokenAddresses - Array of token addresses
 * @param shouldRefetch - Force refetch even if cached
 * @returns Promise resolving to mapping of token addresses to USD rates
 */
export async function fetchUsdRates(
  queryClient: QueryClient,
  getUsdRate: GetUsdRate,
  tokenAddresses: string[],
  shouldRefetch = false,
) {
  let rates: UsdRatesMapper = {}

  await PromisePool.for(tokenAddresses)
    .withConcurrency(5)
    .handleError((_, tokenAddress) => {
      console.error(`Unable to get usd rate for ${tokenAddress}`)
      rates[tokenAddress] = NaN
    })
    .process(async (tokenAddress) => {
      rates[tokenAddress] = await fetchUsdRate(queryClient, getUsdRate, tokenAddress, shouldRefetch)
    })

  return rates
}

/**
 * Clears all cached USD rates from the query client
 * @param queryClient - React Query client to clear cache from
 */
export function clearUsdRates(queryClient: QueryClient) {
  queryClient.removeQueries({
    queryKey: [QUERY_KEY],
    // This will match any query that starts with the QUERY_KEY
    // regardless of what other values are in the query key array
    exact: false,
  })
}

/**
 * Creates standard query options for USD rate queries
 * @param getUsdRate - Function to fetch USD rate
 * @param tokenAddress - Token address to get rate for
 * @returns Query options object for React Query
 */
function createQueryOptions(getUsdRate: GetUsdRate, tokenAddress: string) {
  return queryOptions({
    queryKey: getKey(tokenAddress),
    queryFn: async () => queryFn(getUsdRate, tokenAddress),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * React hook for fetching a single token's USD rate
 * @param getUsdRate - Function to fetch USD rate
 * @param tokenAddress - Token address to get rate for
 * @returns React Query result with USD rate data
 */
export function useUsdRate(getUsdRate: GetUsdRate, tokenAddress: string) {
  return useQuery(createQueryOptions(getUsdRate, tokenAddress))
}

/**
 * React hook for fetching multiple tokens' USD rates in parallel
 * @param getUsdRate - Function to fetch USD rate
 * @param tokenAddresses - Array of token addresses
 * @returns Combined query results with data mapping, loading and error states
 */
export function useUsdRates(getUsdRate: GetUsdRate, tokenAddresses: string[]) {
  const queries = useQueries({
    queries: tokenAddresses.map((address) => createQueryOptions(getUsdRate, address)),
  })

  // Combine results into a mapper for the component
  return {
    data: Object.fromEntries(tokenAddresses.map((address, i) => [address, queries[i].data])),
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
  }
}
