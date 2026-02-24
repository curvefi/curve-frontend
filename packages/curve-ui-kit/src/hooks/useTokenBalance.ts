import { chunk, zip } from 'lodash'
import { useCallback, useMemo } from 'react'
import { type Address, erc20Abi, ethAddress, formatUnits, isAddressEqual } from 'viem'
import { useBalance, useConfig, useReadContracts } from 'wagmi'
import { type QueryObserverOptions, useQueries, type UseQueryResult } from '@tanstack/react-query'
import { combineQueriesToObject, type FieldsOf } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import { type ChainQuery, REFRESH_INTERVAL, type UserQuery } from '@ui-kit/lib/model'
import { Decimal, uniqAddresses } from '@ui-kit/utils'
import { DEFAULT_DECIMALS } from '@ui-kit/utils/units'
import type { Config, GetBalanceReturnType, ReadContractsReturnType } from '@wagmi/core'
import { multicall } from '@wagmi/core'
import { getBalanceQueryOptions, readContractsQueryOptions } from '@wagmi/core/query'

type TokenQuery = { tokenAddress: Address }
type TokenBalanceQuery = ChainQuery & UserQuery & TokenQuery

/** Convert user collateral from GetBalanceReturnType to number */
const convertBalance = ({ value, decimals }: Partial<GetBalanceReturnType>) =>
  formatUnits(value || 0n, decimals || DEFAULT_DECIMALS) as Decimal

/** Create query options for native token balance */
const getNativeBalanceQueryOptions = (config: Config, { chainId, userAddress }: ChainQuery & UserQuery) =>
  getBalanceQueryOptions(config, {
    chainId,
    address: userAddress,
  })

/** Create query contracts for ERC-20 token balance and decimals */
const getERC20QueryContracts = ({ chainId, userAddress, tokenAddress }: TokenBalanceQuery) =>
  [
    { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] },
    { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
  ] as const

type ERC20ReadResult = ReadContractsReturnType<ReturnType<typeof getERC20QueryContracts>>

/**
 * Parse ERC-20 multicall results, throwing if balanceOf fails but defaulting decimals to 18.
 * Some tokens don't implement decimals() (e.g., 3CRV gauge tokens), so we gracefully handle that.
 *
 * @throws When balanceOf call fails - this propagates correctly in:
 *   - `fetchTokenBalance`: thrown in `.then()` rejects the promise
 *   - `useTokenBalances`: thrown in `select` causes TanStack Query to set error state
 *
 * @remarks Not used in `useTokenBalance` hook - it manually extracts errors from the result
 * because throwing outside of `select` would crash the component instead of setting error state.
 */
const parseERC20Results = ([balance, decimals]: ERC20ReadResult) => {
  if (balance.status === 'failure') throw balance.error
  return { value: balance.result, decimals: decimals.status === 'success' ? decimals.result : DEFAULT_DECIMALS }
}

/** In the Curve ecosystem all native chain gas tokens are the 0xeee...eee address */
const isNative = ({ tokenAddress }: TokenQuery) => isAddressEqual(tokenAddress, ethAddress)

/** Imperatively fetch token balance. Uses a staletime of 0 to always be guaranteed of a fresh result. */
export const fetchTokenBalance = async (config: Config, query: TokenBalanceQuery) =>
  isNative(query)
    ? await queryClient
        .fetchQuery({ ...getNativeBalanceQueryOptions(config, query), staleTime: 0 })
        .then((balance) => convertBalance({ value: balance.value, decimals: balance.decimals }))
    : await queryClient
        .fetchQuery({
          ...readContractsQueryOptions(config, { contracts: getERC20QueryContracts(query) }),
          staleTime: 0,
        })
        .then((results) => convertBalance(parseERC20Results(results)))

/**
 * Query freshness configuration for singular token balance queries.
 *
 * Wagmi defaults:
 * - `staleTime: 0` - data is immediately stale, refetches on every mount/focus
 * - `refetchInterval: false` - no automatic background refetching
 *
 * We configure these with low intervals, so we both have a bit of auto refreshing
 * and caching (as it's used in many places and won't cause refetches in quick succession)
 */
const QUERY_FRESHNESS_OPTIONS = {
  staleTime: REFRESH_INTERVAL['10s'],
  refetchInterval: REFRESH_INTERVAL['1m'],
} satisfies Pick<QueryObserverOptions, 'staleTime' | 'refetchInterval'>

/**
 * Query freshness configuration for batch token balance queries via `useQueries`.
 *
 * @remarks
 * Unlike {@link QUERY_FRESHNESS_OPTIONS}, this omits `refetchInterval` to prevent performance
 * issues when querying large token lists (e.g., token selector modal with 1000+ tokens).
 *
 * For the same performance reasons it also has a higher staleTime. We're okay if
 * balances are not super up to date. Once the user decides to further use a token it'll
 * get refetched anyway either thanks to {@link useTokenBalance} or {@link fetchTokenBalance}
 */
const QUERIES_FRESHNESS_OPTIONS = {
  staleTime: REFRESH_INTERVAL['15m'],
} satisfies Pick<QueryObserverOptions, 'staleTime'>

/**
 * Fetch the balance of a single token (native or ERC-20).
 *
 * @remarks Uses `allowFailure: true` for ERC-20 to handle tokens without `decimals()` (e.g., old MKR, gauge tokens).
 * Unlike `useTokenBalances`, this hook cannot use `parseERC20Results` because throwing outside of a `select`
 * function would crash the component. Instead, errors are manually extracted from the multicall result.
 */
export function useTokenBalance(
  { chainId, userAddress, tokenAddress }: FieldsOf<TokenBalanceQuery>,
  // TODO: refactor into a validation suite, same for usePoolTokenBalances and usePoolTokenDepositBalances
  enabled: boolean = true,
) {
  const isEnabled = enabled && chainId != null && userAddress != null && tokenAddress != null
  const isNativeToken = tokenAddress != null && isNative({ tokenAddress })

  const nativeBalance = useBalance({
    ...(isEnabled ? { chainId, address: userAddress } : {}),
    query: { enabled: isEnabled && isNativeToken, ...QUERY_FRESHNESS_OPTIONS },
  })

  // Spreading with ...readContractsQueryOptions() breaks Typescript's type inference, so we have to settle with the
  // least common denominator that does *not* cause type  inference issues, which is getERC20QueryContracts.
  const erc20Balance = useReadContracts({
    contracts: isEnabled ? getERC20QueryContracts({ chainId, userAddress, tokenAddress }) : undefined,
    query: { enabled: isEnabled && !isNativeToken, ...QUERY_FRESHNESS_OPTIONS },
  })

  if (isNativeToken) {
    return {
      data: nativeBalance.data && convertBalance(nativeBalance.data),
      error: nativeBalance.error,
      isLoading: nativeBalance.isLoading,
      isFetched: nativeBalance.isFetched,
      refetch: nativeBalance.refetch,
    }
  }

  // Manually extract balanceOf error since we can't use parseERC20Results (throwing here would cause a crash)
  const [balance, decimals] = erc20Balance.data ?? []

  return {
    data:
      balance?.status === 'success'
        ? convertBalance({ value: balance.result, decimals: decimals?.result ?? DEFAULT_DECIMALS })
        : undefined,
    error: erc20Balance.error ?? (balance?.status === 'failure' ? balance.error : null),
    isLoading: erc20Balance.isLoading,
    isFetched: erc20Balance.isFetched,
    refetch: erc20Balance.refetch,
  }
}

/** Get query options for a token balance (handles both native and ERC-20) */
const getTokenBalanceQueryOptions = (config: Config, query: TokenBalanceQuery) =>
  isNative(query)
    ? {
        ...getNativeBalanceQueryOptions(config, query),
        select: (data: GetBalanceReturnType) => convertBalance(data),
      }
    : {
        ...readContractsQueryOptions(config, { contracts: getERC20QueryContracts(query) }),
        select: (data: ERC20ReadResult) => convertBalance(parseERC20Results(data)),
      }

/**
 * Hook to fetch balances for multiple tokens (native and ERC-20).
 * @remark
 *   Uses `staleTime` for caching but **no auto-refresh** (`refetchInterval`)
 *   to prevent performance issues with large token lists (e.g., token selector modal)
 */
export function useTokenBalances(
  { chainId, userAddress, tokenAddresses = [] }: FieldsOf<ChainQuery & UserQuery> & { tokenAddresses?: Address[] },
  enabled: boolean = true,
) {
  const config = useConfig()

  const isEnabled = enabled && chainId != null && userAddress != null
  const uniqueAddresses = useMemo(() => uniqAddresses(tokenAddresses), [tokenAddresses])

  return useQueries({
    queries: useMemo(
      () =>
        uniqueAddresses.map((tokenAddress) => ({
          ...getTokenBalanceQueryOptions(config, { chainId: chainId!, userAddress: userAddress!, tokenAddress }),
          ...QUERIES_FRESHNESS_OPTIONS,
          enabled: isEnabled,
          /**
           * Only re-render when data or error changes, not on metadata updates (e.g., fetchStatus, dataUpdatedAt).
           * This prevents 1000+ re-renders when many queries resolve in quick succession, like on userAddress or
           * chainId change with a new call to prefetchTokenBalances. If a 1000 tokens update, they all get a new
           * `updatedAt` despite the balance still being zero. We only want re-renders when balances actually change.
           */
          notifyOnChangeProps: ['data', 'error'] as const,
        })) as Parameters<typeof useQueries>[0]['queries'],
      [config, chainId, userAddress, uniqueAddresses, isEnabled],
    ),
    combine: useCallback(
      (results: UseQueryResult[]) => combineQueriesToObject(results as UseQueryResult<Decimal>[], uniqueAddresses),
      [uniqueAddresses],
    ),
  })
}

/**
 * Prefetch balances for multiple tokens into the query cache via a single multicall.
 *
 * We call Wagmi's `multicall` directly instead of `prefetchQuery` per token because
 * Wagmi only batches calls within a single `readContracts` invocation into one `eth_call`.
 * Separate `prefetchQuery` calls each produce their own multicall, even when fired in rapid
 * succession within Viem's batch window. In other words, it batches with multicall, but not
 * efficiently to the extent that we need. By flattening all token contracts (balanceOf + decimals)
 * into one `multicall`, we guarantee minimal RPC round-trips — which matters for 1000+ tokens
 * on rate-limited public RPCs.
 */
export const prefetchTokenBalances = async (
  config: Config,
  { chainId, userAddress, tokenAddresses }: ChainQuery & UserQuery & { tokenAddresses: Address[] },
) => {
  const uniqueAddresses = uniqAddresses(tokenAddresses)

  const nativeToken = uniqueAddresses.find((tokenAddress) => isNative({ tokenAddress }))
  const erc20Addresses = uniqueAddresses.filter((tokenAddress) => !isNative({ tokenAddress }))

  // Prefetch native balance individually (can't be multicalled as it uses wagmi's useBalance, and it's one address anyway)
  if (nativeToken) {
    const query = { chainId, userAddress, tokenAddress: nativeToken }
    await queryClient.prefetchQuery({
      ...getNativeBalanceQueryOptions(config, query),
      ...QUERIES_FRESHNESS_OPTIONS,
    })
  }

  // Batch all ERC-20 tokens into a single multicall, then seed individual cache entries.
  // Wagmi config handles multicall batching by batchSize under the hood (defaults to 1_024 bytes)
  if (!erc20Addresses.length) return

  const tokenContracts = erc20Addresses.map((tokenAddress) =>
    getERC20QueryContracts({ chainId, userAddress, tokenAddress }),
  )
  const results = await multicall(config, { chainId, contracts: tokenContracts.flat() })
  const updatedAt = Date.now()

  // Each token uses 2 contracts (balanceOf + decimals), so chunk results by 2
  // Failures are fine — allowFailure defaults to true, so failed calls are seeded as
  // { status: 'failure' } entries. Downstream consumers (useTokenBalance, fetchTokenBalance)
  // already handle per-token failures gracefully.
  zip(tokenContracts, chunk(results, 2))
    .map(([contracts, tokenResults]) => [readContractsQueryOptions(config, { contracts }), tokenResults] as const)
    .forEach(([{ queryKey }, tokenResults]) => queryClient.setQueryData(queryKey, tokenResults, { updatedAt }))
}
