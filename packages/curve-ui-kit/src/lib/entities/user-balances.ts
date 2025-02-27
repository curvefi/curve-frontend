import { useQuery, type QueryClient, queryOptions } from '@tanstack/react-query'
import PromisePool from '@supercharge/promise-pool'
import chunk from 'lodash/chunk'
import flatten from 'lodash/flatten'

/**
 * This query may store duplicate data. For example, two keys like
 * ['userBalances', 'eth', 'usdc'] and ['userBalances', 'eth', 'usdc', 'usdt'] aren't identical.
 *
 * This means we store the balances of ETH and USDC twice. However, splitting into
 * individual keys like ['userBalances', 'eth'], ['userBalances', 'usdc'] isn't worthwhile, as
 * the data doesn't consume much memory and we're using batch calls anyway.
 *
 * Consider a scenario where
 * ['userBalances', 'eth'] exists and you need data for ['userBalances', 'eth', 'usdc'],
 * even though ETH data is present, USDC data isn't, so you'd still need to fetch data.
 */

export type UserBalances = { [tokenAddress: string]: string | undefined }

const QUERY_KEY = 'userBalances' as const

/** Function type for fetching balances for multiple tokens */
type GetBalances = ((coins: string[]) => Promise<string[]>) | undefined

/** Generates a query key for a list of token addresses */
function getKey(tokenAddresses: string[]) {
  return [QUERY_KEY, ...tokenAddresses] as const
}

/**
 * Core fetching logic without cache checking
 * Fetches balances for multiple tokens in a single call, but returns them mapped by address
 * Handles errors by retrying failed tokens individually
 * @param getBalances - Function to fetch balances for multiple tokens
 * @param tokenAddresses - Array of token addresses to get balances for
 * @returns Promise resolving to an object mapping token addresses to their balances
 */
export async function queryFn(getBalances: GetBalances, tokenAddresses: string[]) {
  if (!tokenAddresses.length || !getBalances) {
    return {}
  }

  // Create a mapping of address -> balance
  const results: UserBalances = {}

  const errors: string[][] = []
  const chunks = chunk(tokenAddresses, 20)

  await PromisePool.for(chunks)
    .withConcurrency(10)
    .handleError((_, chunk) => {
      errors.push(chunk)
    })
    .process(async (addresses) => {
      const balances = await getBalances(addresses)

      for (const idx in balances) {
        const balance = balances[idx]
        const address = addresses[idx]
        results[address] = balance
      }
    })

  const flattenedErrors = flatten(errors)

  if (flattenedErrors.length) {
    await PromisePool.for(flattenedErrors)
      .handleError((_, address) => {
        results[address] = undefined
      })
      .process(async (address) => {
        const [balance] = await getBalances([address])
        results[address] = balance
      })
  }

  return results
}

/**
 * Fetches balances for multiple tokens with cache support. Usable outside React.
 * @param queryClient - React Query client
 * @param getBalances - Function to fetch balances for multiple tokens
 * @param tokenAddresses - Array of token addresses to get balances for
 * @param shouldRefetch - Force refetch even if cached
 * @returns Promise resolving to an object mapping token addresses to their balances
 */
export async function fetchUserBalances(
  queryClient: QueryClient,
  getBalances: GetBalances,
  tokenAddresses: string[],
  shouldRefetch = false,
) {
  if (shouldRefetch) {
    queryClient.removeQueries({ queryKey: getKey(tokenAddresses) })
  }

  return queryClient.fetchQuery(createQueryOptions(getBalances, tokenAddresses))
}

/**
 * Clears all cached token balances from the query client
 * @param queryClient - React Query client to clear cache from
 */
export function clearUserBalances(queryClient: QueryClient) {
  queryClient.removeQueries({
    queryKey: [QUERY_KEY],
    // This will match any query that starts with the QUERY_KEY
    // regardless of what other values are in the query key array
    exact: false,
  })
}

/**
 * Sets (prefills) the query cache with user balances data from an external source
 * @param queryClient - React Query client
 * @param balances - Object mapping token addresses to their balances
 */
export function setUserBalances(queryClient: QueryClient, balances: UserBalances) {
  const tokenAddresses = Object.keys(balances)

  queryClient.setQueryData(getKey(tokenAddresses), balances, {
    updatedAt: Date.now(),
  })
}

/**
 * Creates standard query options for balance queries
 * @param getBalances - Function to fetch balances for multiple tokens
 * @param tokenAddresses - Array of token addresses to get balances for
 * @returns Query options object for React Query
 */
function createQueryOptions(getBalances: GetBalances, tokenAddresses: string[]) {
  return queryOptions({
    queryKey: getKey(tokenAddresses),
    queryFn: async () => queryFn(getBalances, tokenAddresses),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * React hook for fetching multiple token balances
 * @param getBalances - Function to fetch balances for multiple tokens
 * @param tokenAddresses - Array of token addresses to get balances for
 * @returns React Query result with token balances data
 */
export function useUserBalances(getBalances: GetBalances, tokenAddresses: string[]) {
  return useQuery(createQueryOptions(getBalances, tokenAddresses))
}
