import { useMemo } from 'react'
import type { Address } from 'viem'
import type { Config } from 'wagmi'
import { requireLib, useCurve, type CurveApi } from '@ui-kit/features/connect-wallet'
import { fetchTokenBalance, useTokenBalances } from '@ui-kit/hooks/useTokenBalance'

/** Hook to get all pool token balances for underlying tokens */
export function usePoolTokenBalances(
  {
    chainId,
    userAddress,
    poolId,
  }: {
    chainId: number | null | undefined
    userAddress: Address | null | undefined
    poolId: string | null | undefined
  },
  enabled = true,
) {
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated && poolId ? curveApi!.getPool(poolId) : undefined),
    [curveApi, isHydrated, poolId],
  )

  const { data: wrappedCoinsBalances, isLoading: wrappedCoinsLoading } = useTokenBalances(
    {
      chainId,
      userAddress,
      tokenAddresses: pool?.wrappedCoinAddresses as Address[],
    },
    enabled && pool != null,
  )

  const { data: underlyingCoinsBalances, isLoading: underlyingCoinsLoading } = useTokenBalances(
    {
      chainId,
      userAddress,
      tokenAddresses: pool?.underlyingCoinAddresses as Address[],
    },
    enabled && pool != null,
  )

  const isLoading = wrappedCoinsLoading || underlyingCoinsLoading

  return {
    wrappedCoinsBalances,
    underlyingCoinsBalances,
    isLoading,
  }
}

/** Temporary imperative function for some zustand slices to fetch all pool token balances */
export async function fetchPoolTokenBalances(config: Config, curve: CurveApi, poolId: string) {
  const pool = requireLib('curveApi').getPool(poolId)
  const chainId = curve.chainId
  const userAddress = curve.signerAddress as Address

  const balances = await Promise.allSettled([
    ...(pool.wrappedCoinAddresses as Address[]).map((tokenAddress) =>
      fetchTokenBalance(config, { chainId, userAddress, tokenAddress }).then(
        (balance) => [tokenAddress, balance] as const,
      ),
    ),
    ...(pool.underlyingCoinAddresses as Address[]).map((tokenAddress) =>
      fetchTokenBalance(config, { chainId, userAddress, tokenAddress }).then(
        (balance) => [tokenAddress, balance] as const,
      ),
    ),
  ])

  return Object.fromEntries(balances.filter((x) => x.status === 'fulfilled').map((x) => x.value))
}
