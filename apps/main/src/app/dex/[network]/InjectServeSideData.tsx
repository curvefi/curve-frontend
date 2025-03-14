'use client'
import { type ReactNode, useEffect } from 'react'
import useStore from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheMapper, ValueMapperCached } from '@/dex/types/main.types'

type ServerSideStoreProps = {
  chainId: ChainId
  pools: PoolDataCacheMapper
  tvl: ValueMapperCached
  volume: ValueMapperCached
  children: ReactNode
}

export const InjectServeSideData = ({ chainId, pools, tvl, volume, children }: ServerSideStoreProps) => {
  const setServerPreloadData = useStore((state) => state.storeCache.setServerPreloadData)
  useEffect(() => {
    setServerPreloadData(chainId, { pools, tvl, volume })
    console.log(
      `Injected ${Object.values(pools).length} pools, ${Object.keys(tvl).length} TVL, and ${Object.keys(volume).length} volume for chain ${chainId}`,
    )
  }, [setServerPreloadData, chainId, pools, tvl, volume])
  return children
}
