import { useCallback, useMemo } from 'react'
import { erc20Abi, ethAddress, formatUnits, isAddressEqual, type Address } from 'viem'
import { useConfig } from 'wagmi'
import { useBalance, useReadContracts } from 'wagmi'
import { useQueries, type QueriesResults } from '@tanstack/react-query'
import { combineQueriesToObject, type FieldsOf } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model'
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
          ...readContractsQueryOptions(config, {
            allowFailure: true,
            contracts: getERC20QueryContracts(query),
          }),
          staleTime: 0,
        })
        .then((results) => convertBalance(parseERC20Results(results)))

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
  const config = useConfig()

  const isEnabled = enabled && chainId != null && userAddress != null && tokenAddress != null
  const isNativeToken = tokenAddress != null && isNative({ tokenAddress })

  const nativeBalance = useBalance({
    ...(isEnabled ? getNativeBalanceQueryOptions(config, { chainId, userAddress }) : {}),
    query: { enabled: isEnabled && isNativeToken },
  })

  // Spreading with ...readContractsQueryOptions() breaks Typescript's type inference, so we have to settle with the
  // least common denominator that does *not* cause type  inference issues, which is getERC20QueryContracts.
  const erc20Balance = useReadContracts({
    allowFailure: true,
    contracts: isEnabled ? getERC20QueryContracts({ chainId, userAddress, tokenAddress }) : undefined,
    query: { enabled: isEnabled && !isNativeToken },
  })

  if (isNativeToken) {
    return {
      data: nativeBalance.data && convertBalance(nativeBalance.data),
      error: nativeBalance.error,
      isLoading: nativeBalance.isLoading,
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
        ...readContractsQueryOptions(config, {
          allowFailure: true,
          contracts: getERC20QueryContracts(query),
        }),
        select: (data: ERC20ReadResult) => convertBalance(parseERC20Results(data)),
      }

/** Hook to fetch balances for multiple tokens */
export function useTokenBalances(
  { chainId, userAddress, tokenAddresses = [] }: FieldsOf<ChainQuery & UserQuery> & { tokenAddresses?: Address[] },
  enabled: boolean = true,
) {
  const config = useConfig()

  const isEnabled = enabled && chainId != null && userAddress != null
  const uniqueAddresses = useMemo(() => Array.from(new Set(tokenAddresses)), [tokenAddresses])

  return useQueries({
    queries: useMemo(
      () =>
        uniqueAddresses.map((tokenAddress) => ({
          ...getTokenBalanceQueryOptions(config, { chainId: chainId!, userAddress: userAddress!, tokenAddress }),
          enabled: isEnabled,
        })),
      [config, chainId, userAddress, uniqueAddresses, isEnabled],
    ),
    combine: useCallback(
      (results: QueriesResults<ReturnType<typeof getTokenBalanceQueryOptions>[]>) =>
        combineQueriesToObject(results, uniqueAddresses),
      [uniqueAddresses],
    ),
  })
}
