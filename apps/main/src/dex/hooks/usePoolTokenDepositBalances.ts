import { useMemo } from 'react'
import { type Address, isAddressEqual, zeroAddress } from 'viem'
import type { Config } from 'wagmi'
import { useCurve } from '@evm-ui/features/connect-wallet'
import type { CurveApi } from '@evm-ui/features/connect-wallet/lib/types'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import { fetchTokenBalance, useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { ChainQuery, PoolQuery, UserQuery } from '@evm-ui/queries/query-types'
import { q } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

type Query = ChainQuery & UserQuery & PoolQuery
type Params = FieldsOf<Query>

/** Hook to get lp token and possible gauge token balances */
export function usePoolTokenDepositBalances({ chainId, userAddress, poolAddress }: Params, enabled = true) {
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated && poolAddress ? curveApi!.getPool(poolAddress) : undefined),
    [curveApi, isHydrated, poolAddress],
  )

  const hasGauge = pool?.gauge.address != null && !isAddressEqual(pool.gauge.address as Address, zeroAddress)
  return {
    hasGauge,
    lpTokenBalance: q(
      useHydratedQuery(useTokenBalance, { chainId, userAddress, tokenAddress: pool?.lpToken as Address }, enabled),
    ),
    gaugeTokenBalance: q(
      useHydratedQuery(
        useTokenBalance,
        { chainId, userAddress, tokenAddress: pool?.gauge.address as Address },
        enabled && hasGauge,
      ),
    ),
  }
}

/** Temporary imperative function for some zustand slices */
export const fetchPoolLpTokenBalance = (config: Config, curve: CurveApi, poolAddress: Address) =>
  fetchTokenBalance(config, {
    chainId: curve?.chainId,
    userAddress: curve.signerAddress,
    tokenAddress: curve.getPool(poolAddress).lpToken as Address,
  })
