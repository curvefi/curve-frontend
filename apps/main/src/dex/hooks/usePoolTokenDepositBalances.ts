import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { Config } from 'wagmi'
import { requireLib, useCurve, type CurveApi } from '@ui-kit/features/connect-wallet'
import { fetchTokenBalance, useTokenBalance } from '@ui-kit/queries/token-balance.query'
import { isValidAddress } from '../utils'

/** Hook to get lp token and possible gauge token balances */
export function usePoolTokenDepositBalances(
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
  const pool = chainId && userAddress && poolId && curveApi && isHydrated ? curveApi.getPool(poolId) : undefined

  const { data: lpTokenBalance, isLoading: lpTokenLoading } = useTokenBalance(
    {
      chainId,
      userAddress,
      tokenAddress: pool?.lpToken as Address,
    },
    enabled && pool != null,
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

  const isLoading = lpTokenLoading || gaugeTokenLoading

  return {
    isLoading,
    lpTokenBalance,
    hasGauge,
    gaugeTokenBalance,
  }
}

/** Temporary imperative function for some zustand slices */
export function fetchPoolLpTokenBalance(config: Config, curve: CurveApi, poolId: string) {
  const pool = requireLib('curveApi').getPool(poolId)

  return fetchTokenBalance(config, {
    chainId: curve?.chainId,
    userAddress: curve.signerAddress as Address,
    tokenAddress: pool.lpToken as Address,
  })
}

/** Temporary imperative function for some zustand slices */
export function fetchPoolGaugeTokenBalance(config: Config, curve: CurveApi, poolId: string) {
  const pool = requireLib('curveApi').getPool(poolId)
  if (!isValidAddress(pool.gauge.address)) return Promise.resolve('0')

  return fetchTokenBalance(config, {
    chainId: curve?.chainId,
    userAddress: curve.signerAddress as Address,
    tokenAddress: pool.lpToken as Address,
  })
}
