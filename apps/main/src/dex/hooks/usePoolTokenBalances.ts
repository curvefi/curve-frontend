import { useMemo } from 'react'
import type { Config } from 'wagmi'
import type { Address } from '@primitives/address.utils'
import { useCurve, type CurveApi } from '@ui-kit/features/connect-wallet'
import { fetchTokenBalance, useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery, PoolQuery, UserQuery } from '@ui-kit/lib/model'

type Query = ChainQuery & UserQuery & PoolQuery
type Params = FieldsOf<Query>

/** Hook to get all pool token balances for underlying tokens */
export function usePoolTokenBalances({ chainId, userAddress, poolId }: Params, enabled = true) {
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated && poolId ? curveApi!.getPool(poolId) : undefined),
    [curveApi, isHydrated, poolId],
  )

  const {
    data: wrappedCoinsBalances,
    isLoading: wrappedCoinsLoading,
    error: wrappedCoinsError,
  } = useTokenBalances(
    {
      chainId,
      userAddress,
      tokenAddresses: pool?.wrappedCoinAddresses as Address[],
    },
    enabled && isHydrated,
  )

  const {
    data: underlyingCoinsBalances,
    isLoading: underlyingCoinsLoading,
    error: underlyingCoinsError,
  } = useTokenBalances(
    {
      chainId,
      userAddress,
      tokenAddresses: pool?.underlyingCoinAddresses as Address[],
    },
    enabled && isHydrated,
  )

  return {
    wrappedCoinsBalances,
    underlyingCoinsBalances,
    isLoading: wrappedCoinsLoading || underlyingCoinsLoading,
    error: wrappedCoinsError || underlyingCoinsError,
  }
}

/** Temporary imperative function for some zustand slices to fetch all pool token balances */
export const fetchPoolTokenBalances = async (config: Config, curve: CurveApi, poolId: string) => {
  const { wrappedCoinAddresses, underlyingCoinAddresses } = curve.getPool(poolId)
  const chainId = curve.chainId
  const userAddress = curve.signerAddress as Address

  const balances = await Promise.allSettled([
    ...(wrappedCoinAddresses as Address[]).map((tokenAddress) =>
      fetchTokenBalance(config, { chainId, userAddress, tokenAddress }).then(
        (balance) => [tokenAddress, balance] as const,
      ),
    ),
    ...(underlyingCoinAddresses as Address[]).map((tokenAddress) =>
      fetchTokenBalance(config, { chainId, userAddress, tokenAddress }).then(
        (balance) => [tokenAddress, balance] as const,
      ),
    ),
  ])

  return Object.fromEntries(balances.filter((x) => x.status === 'fulfilled').map((x) => x.value))
}
