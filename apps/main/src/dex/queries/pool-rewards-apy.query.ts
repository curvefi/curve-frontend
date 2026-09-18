import { useCallback, useMemo } from 'react'
import { test } from 'vest'
import { fetchNetworks } from '@/dex/entities/networks'
import { curvejsApi } from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { QueryData } from '@evm-ui/lib'
import { type ChainParams, type PoolParams, type PoolQuery, rootKeys } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { combineQueriesToObject } from '@ui/features/queries/combine'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type PoolRewardsApyQuery = PoolQuery<ChainId> & { useApi: boolean }
type PoolRewardsApyParams = FieldsOf<PoolRewardsApyQuery>

const {
  useQuery: usePoolRewardsApyQuery,
  getQueryOptions: getPoolRewardsApyQueryOptions,
  fetchQuery: fetchPoolRewardsApy,
  getQueryData: getPoolRewardsApyQueryData,
  invalidate: invalidatePoolRewardsApyQuery,
} = queryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolId, useApi }: PoolRewardsApyParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'rewardsApy', { useApi }] as const,
  queryFn: async ({ chainId, poolId, useApi }: PoolRewardsApyQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const networks = await fetchNetworks()
    return curvejsApi.pool.poolAllRewardsApy(networks[chainId], pool, useApi)
  },
  validationSuite: createValidationSuite((params: PoolRewardsApyParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
    test('useApi', () => {
      enforce(params.useApi).isBoolean()
    })
  }),
})

export { fetchPoolRewardsApy, getPoolRewardsApyQueryData }

export const invalidatePoolRewardsApy = (params: PoolParams<ChainId>) =>
  Promise.all([true, false].map(useApi => invalidatePoolRewardsApyQuery({ ...params, useApi })))

/** Prefer on-chain rewards for pool details when a wallet is connected. */
export function usePoolRewardsApy(params: PoolParams<ChainId>) {
  const { curveApi, isHydrated } = useCurve()
  return usePoolRewardsApyQuery({ ...params, useApi: !curveApi?.signerAddress }, isHydrated)
}

type PoolRewardsApyOptions = ReturnType<typeof getPoolRewardsApyQueryOptions>

/** Slop coded hook only for the dashboard to fetch multiple APYs all at once that will need a rewrite anyway. */
export function usePoolsRewardsApy({ chainId, poolIds = [] }: ChainParams<ChainId> & { poolIds?: string[] }) {
  const { isHydrated } = useCurve()
  const uniquePoolIds = useMemo(() => Array.from(new Set(poolIds)), [poolIds])
  return useQueries({
    queries: useMemo(
      () =>
        uniquePoolIds.map(poolId =>
          getPoolRewardsApyQueryOptions(
            { chainId, poolId, useApi: false /* need a connected wallet anyway */ },
            isHydrated,
          ),
        ),
      [chainId, uniquePoolIds, isHydrated],
    ),
    combine: useCallback(
      (results: QueriesResults<PoolRewardsApyOptions[]>) => combineQueriesToObject(results, uniquePoolIds),
      [uniquePoolIds],
    ),
  })
}

export type RewardsApy = QueryData<typeof usePoolRewardsApyQuery>
