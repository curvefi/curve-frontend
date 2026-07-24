import { useMemo } from 'react'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { Config } from 'wagmi'
import { type CurveApi, useCurve } from '@ui-kit/features/connect-wallet'
import { fetchTokenBalance, useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery, PoolQuery, UserQuery } from '@ui-kit/lib/model'
import { q } from '@ui-kit/types/util'

type Query = ChainQuery & UserQuery & PoolQuery
type Params = FieldsOf<Query>

/** Hook to get lp token and possible gauge token balances */
export function usePoolTokenDepositBalances({ chainId, userAddress, poolId }: Params, enabled = true) {
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated && poolId ? curveApi!.getPool(poolId) : undefined),
    [curveApi, isHydrated, poolId],
  )

  const hasGauge = pool?.gauge.address != null && !isAddressEqual(pool.gauge.address as Address, zeroAddress)
  return {
    hasGauge,
    lpTokenBalance: q(
      useTokenBalance({ chainId, userAddress, tokenAddress: pool?.lpToken as Address }, enabled && isHydrated),
    ),
    gaugeTokenBalance: q(
      useTokenBalance({ chainId, userAddress, tokenAddress: pool?.gauge.address as Address }, enabled && hasGauge),
    ),
  }
}

/** Temporary imperative function for some zustand slices */
export const fetchPoolLpTokenBalance = (config: Config, curve: CurveApi, poolId: string) =>
  fetchTokenBalance(config, {
    chainId: curve?.chainId,
    userAddress: curve.signerAddress,
    tokenAddress: curve.getPool(poolId).lpToken as Address,
  })
