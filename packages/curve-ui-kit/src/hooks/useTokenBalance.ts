import { useCallback, useMemo } from 'react'
import { erc20Abi, ethAddress, formatUnits, isAddressEqual, type Address } from 'viem'
import { useConfig, useBalance, useBlockNumber, useReadContracts } from 'wagmi'
import { useQueries, type QueryObserverOptions, type UseQueryResult } from '@tanstack/react-query'
import { type FieldsOf } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL, type ChainQuery, type UserQuery } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import type { Config, ReadContractsReturnType } from '@wagmi/core'
import type { GetBalanceReturnType } from '@wagmi/core'
import { getBalanceQueryOptions, readContractsQueryOptions } from '@wagmi/core/query'

type TokenQuery = { tokenAddress: Address }
type TokenBalanceQuery = ChainQuery & UserQuery & TokenQuery

/** Best case guess if for some reason we don't know the actual amount of decimals */
const DEFAULT_DECIMALS = 18

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

type ERC20ReadResult = ReadContractsReturnType<ReturnType<typeof getERC20QueryContracts>, true>

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
          ...readContractsQueryOptions(config, { allowFailure: true, contracts: getERC20QueryContracts(query) }),
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
const ERC20_BALANCE_BATCH_SIZE = 120
const PINNED_BLOCK_STALE_TIME_MS = REFRESH_INTERVAL['10s']

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
    allowFailure: true,
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
  const { data: pinnedBlockNumber } = useBlockNumber({
    chainId,
    query: { enabled: isEnabled, staleTime: PINNED_BLOCK_STALE_TIME_MS, refetchOnWindowFocus: false },
  })
  const uniqueAddresses = useMemo(() => Array.from(new Set(tokenAddresses)), [tokenAddresses])
  const nativeAddress = useMemo(
    () => uniqueAddresses.find((tokenAddress) => isNative({ tokenAddress })),
    [uniqueAddresses],
  )
  const erc20Addresses = useMemo(
    () => uniqueAddresses.filter((tokenAddress) => !isNative({ tokenAddress })),
    [uniqueAddresses],
  )
  const erc20AddressChunks = useMemo(() => chunkAddresses(erc20Addresses, ERC20_BALANCE_BATCH_SIZE), [erc20Addresses])

  return useQueries({
    queries: useMemo(
      () =>
        [
          ...(nativeAddress
            ? [
                {
                  ...getNativeBalanceQueryOptions(config, {
                    chainId: chainId!,
                    userAddress: userAddress!,
                    ...(pinnedBlockNumber ? { blockNumber: pinnedBlockNumber } : {}),
                  }),
                  ...QUERIES_FRESHNESS_OPTIONS,
                  enabled: isEnabled,
                  select: (data: GetBalanceReturnType) => ({ [nativeAddress]: convertBalance(data) }),
                },
              ]
            : []),
          ...erc20AddressChunks.map((addresses) => {
            const contracts = addresses.flatMap((tokenAddress) =>
              getERC20QueryContracts({
                chainId: chainId!,
                userAddress: userAddress!,
                tokenAddress,
              }),
            )
            return {
              ...readContractsQueryOptions(config, {
                allowFailure: true,
                contracts,
                ...(pinnedBlockNumber ? { blockNumber: pinnedBlockNumber } : {}),
              }),
              ...QUERIES_FRESHNESS_OPTIONS,
              enabled: isEnabled,
              select: (results: ReadContractsReturnType<typeof contracts, true>) =>
                parseERC20BatchResults(addresses, results as ReadContractResult[]),
            }
          }),
        ] as Parameters<typeof useQueries>[0]['queries'],
      [config, chainId, erc20AddressChunks, isEnabled, nativeAddress, pinnedBlockNumber, userAddress],
    ),
    combine: useCallback((results: UseQueryResult[]) => {
      const typedResults = results as UseQueryResult<Record<string, Decimal>>[]
      return {
        data: Object.assign({}, ...typedResults.map(({ data }) => data ?? {})) as Record<string, Decimal>,
        isLoading: typedResults.some((result) => result.isLoading),
        isPending: typedResults.some((result) => result.isPending),
        isError: typedResults.some((result) => result.isError),
        isFetching: typedResults.some((result) => result.isFetching),
        error: typedResults.find((result) => result.error)?.error,
      }
    }, []),
  })
}

/** Prefetch balances for multiple tokens into the query cache. Fire-and-forget, so no need to await. */
export const prefetchTokenBalances = (
  config: Config,
  { chainId, userAddress, tokenAddresses }: ChainQuery & UserQuery & { tokenAddresses: Address[] },
) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))
  const nativeAddress = uniqueAddresses.find((tokenAddress) => isNative({ tokenAddress }))
  const erc20Addresses = uniqueAddresses.filter((tokenAddress) => !isNative({ tokenAddress }))

  if (nativeAddress) {
    void queryClient.prefetchQuery({
      ...getNativeBalanceQueryOptions(config, { chainId, userAddress }),
      ...QUERIES_FRESHNESS_OPTIONS,
    })
  }

  const erc20AddressChunks = chunkAddresses(erc20Addresses, ERC20_BALANCE_BATCH_SIZE)
  erc20AddressChunks.forEach((addresses) => {
    const contracts = addresses.flatMap((tokenAddress) =>
      getERC20QueryContracts({
        chainId,
        userAddress,
        tokenAddress,
      }),
    )

    void queryClient.prefetchQuery({
      ...readContractsQueryOptions(config, { allowFailure: true, contracts }),
      ...QUERIES_FRESHNESS_OPTIONS,
    })
  })
}

function chunkAddresses(addresses: Address[], size: number) {
  const chunks: Address[][] = []
  for (let i = 0; i < addresses.length; i += size) {
    chunks.push(addresses.slice(i, i + size))
  }
  return chunks
}

function parseERC20BatchResults(tokenAddresses: Address[], results: ReadContractResult[]) {
  const balances: Record<string, Decimal> = {}
  for (let i = 0; i < tokenAddresses.length; i++) {
    const balanceResult = results[i * 2]
    const decimalsResult = results[i * 2 + 1]
    if (balanceResult?.status !== 'success') continue

    balances[tokenAddresses[i]] = convertBalance({
      value: balanceResult.result as bigint,
      decimals: decimalsResult?.status === 'success' ? (decimalsResult.result as number) : DEFAULT_DECIMALS,
    })
  }
  return balances
}

type ReadContractResult = { status: 'success'; result: unknown } | { status: 'failure'; error: Error }
