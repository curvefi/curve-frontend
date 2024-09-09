import { createQueryHook } from '@/shared/lib/queries/factory'
import { liquidityQueryOptions, poolMappingQueryOptions, volumeQueryOptions } from '@/entities/pool/model/query-options'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'

export const usePoolMapping = createQueryHook(poolMappingQueryOptions)

export const usePools = (chainId: ChainId) => {
  const { data: pools, ...rest } = usePoolMapping({ chainId })
  const data = useMemo(() => pools && Object.values(pools), [pools])
  return { data, error: rest.error }
}

export const useLiquidity = createQueryHook(liquidityQueryOptions)

export const useVolume = createQueryHook(volumeQueryOptions)

type StringResult = UseQueryResult<string, Error>

const createPoolMapping = (results: StringResult[], pools?: PoolData[]): VolumeMapper | TvlMapper | undefined =>
  pools && Object.fromEntries(
    results.map(({ data, error }, index) => [pools[index].pool.id, {
      value: data ?? '0',
      errorMessage: error?.message || '',
      poolId: pools[index].pool.id
    }])
  )

export const useVolumeMapping = (chainId: ChainId) => {
  const { data: pools } = usePools(chainId);
  useEffect(() => console.info(`useVolumeMapping`, chainId, pools), [chainId, pools])
  return useQueries({
    queries: useMemo(() => pools?.map(p => volumeQueryOptions({
      chainId,
      poolId: p.pool.id
    })), [chainId, pools]) || [],
    combine: useCallback(
      (results: StringResult[]) => createPoolMapping(results, pools), [pools])
  })
}

export const useLiquidityMapping = (chainId: ChainId) => {
  const { data: pools } = usePools(chainId);
  useEffect(() => console.info(`useLiquidityMapping`, chainId, pools), [chainId, pools])
  return useQueries({
    queries: useMemo(() => pools?.map(p => liquidityQueryOptions({
      chainId,
      poolId: p.pool.id
    })), [chainId, pools]) || [],
    combine: useCallback(
      (results: StringResult[]) => createPoolMapping(results, pools), [pools])
  })
}
