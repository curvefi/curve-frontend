import { createQueryHook } from '@/shared/lib/queries/factory'
import { liquidityQueryOptions, volumeQueryOptions } from '@/entities/pool/model/query-options'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useTraceUpdate } from '@/useTraceUpdate'

export const useLiquidity = createQueryHook(liquidityQueryOptions)

export const useVolume = createQueryHook(volumeQueryOptions)

type StringResult = UseQueryResult<string, Error>

const createMapping = (results: StringResult[], pools: PoolData[]): VolumeMapper | TvlMapper => Object.fromEntries(
  results.map(({ data, error }, index) => [pools[index].pool.id, {
    value: data ?? '0',
    errorMessage: error?.message || '',
    poolId: pools[index].pool.id
  }])
)

export const useVolumeMapping = (chainId: ChainId, pools?: PoolData[]) =>
  useQueries({
    queries: useMemo(() => pools?.map(p => volumeQueryOptions({
      chainId,
      poolId: p.pool.id
    })), [chainId, pools]) || [],
    combine: useCallback(
      (results: StringResult[]) => createMapping(results, pools!), [pools])
  })

export const useLiquidityMapping = (chainId: ChainId, pools?: PoolData[]) =>
  useQueries({
    queries: useMemo(() => pools?.map(p => liquidityQueryOptions({
      chainId,
      poolId: p.pool.id
    })), [chainId, pools]) || [],
    combine: useCallback(
      (results: StringResult[]) => createMapping(results, pools!), [pools])
  })
