import { useMemo } from 'react'
import type { Config } from 'wagmi'
import { useCurve, type CurveApi } from '@evm-ui/features/connect-wallet'
import { fetchTokenBalance, useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import type { ChainQuery, PoolQuery, UserQuery } from '@evm-ui/queries/query-types'
import type { Address } from '@primitives/address.utils'
import { notFalsyArray, recordValues } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import type { FieldsOf } from '@ui/lib/validation/types'

type Query = ChainQuery & UserQuery & PoolQuery
type Params = FieldsOf<Query>

/** Fetch pool token balances and expose their combined loading/error state. */
export function usePoolTokenBalances({ chainId, userAddress, poolId }: Params) {
  const { curveApi, isHydrated } = useCurve()
  const { underlyingCoinAddresses, wrappedCoinAddresses } =
    useMemo(() => (isHydrated && poolId ? curveApi!.getPool(poolId) : undefined), [curveApi, isHydrated, poolId]) ?? {}

  const balances = useTokenBalances(
    { chainId, userAddress, tokenAddresses: notFalsyArray(wrappedCoinAddresses, underlyingCoinAddresses) as Address[] },
    isHydrated,
  )
  return useMemo(() => combineQueryState(...recordValues(balances)), [balances])
}

/** Temporary imperative function for some zustand slices to fetch all pool token balances */
export const fetchPoolTokenBalances = async (config: Config, curve: CurveApi, poolId: string) => {
  const { wrappedCoinAddresses, underlyingCoinAddresses } = curve.getPool(poolId)
  const chainId = curve.chainId
  const userAddress = curve.signerAddress

  const balances = await Promise.allSettled([
    ...(wrappedCoinAddresses as Address[]).map(tokenAddress =>
      fetchTokenBalance(config, { chainId, userAddress, tokenAddress }).then(
        balance => [tokenAddress, balance] as const,
      ),
    ),
    ...(underlyingCoinAddresses as Address[]).map(tokenAddress =>
      fetchTokenBalance(config, { chainId, userAddress, tokenAddress }).then(
        balance => [tokenAddress, balance] as const,
      ),
    ),
  ])

  return Object.fromEntries(balances.filter(x => x.status === 'fulfilled').map(x => x.value))
}
