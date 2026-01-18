import { useMemo } from 'react'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { Config } from 'wagmi'
import { useCurve, type CurveApi } from '@ui-kit/features/connect-wallet'
import { fetchTokenBalance, useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery, PoolQuery, UserQuery } from '@ui-kit/lib/model'

type Query = ChainQuery & UserQuery & PoolQuery
type Params = FieldsOf<Query>

/** Hook to get lp token and possible gauge token balances */
export function usePoolTokenDepositBalances({ chainId, userAddress, poolId }: Params, enabled = true) {
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated && poolId ? curveApi!.getPool(poolId) : undefined),
    [curveApi, isHydrated, poolId],
  )

  const { data: lpTokenBalance, isLoading: lpTokenLoading } = useTokenBalance(
    {
      chainId,
      userAddress,
      tokenAddress: pool?.lpToken as Address,
    },
    enabled && isHydrated,
  )

  const hasGauge = pool?.gauge.address != null && !isAddressEqual(pool.gauge.address as Address, zeroAddress)
  const { data: gaugeTokenBalance, isLoading: gaugeTokenLoading } = useTokenBalance(
    {
      chainId,
      userAddress,
      tokenAddress: pool?.gauge.address as Address,
    },
    enabled && hasGauge,
  )

  return {
    lpTokenBalance,
    hasGauge,
    gaugeTokenBalance,
    isLoading: lpTokenLoading || gaugeTokenLoading,
  }
}

/** Temporary imperative function for some zustand slices */
export const fetchPoolLpTokenBalance = (config: Config, curve: CurveApi, poolId: string) =>
  fetchTokenBalance(config, {
    chainId: curve?.chainId,
    userAddress: curve.signerAddress as Address,
    tokenAddress: curve.getPool(poolId).lpToken as Address,
  })
