'use client'
import { type ReactNode, useEffect } from 'react'
import useStore from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheMapper, ValueMapperCached } from '@/dex/types/main.types'

type ServerSideStoreProps = {
  chainId: ChainId
  pools?: PoolDataCacheMapper
  tvl?: ValueMapperCached
  volume?: ValueMapperCached
  children: ReactNode
}

export const InjectServeSideData = ({ chainId, pools, tvl, volume, children }: ServerSideStoreProps) => {
  const setServerPreloadData = useStore(state => state.storeCache.setServerPreloadData)
  useEffect(() => {
    if (pools || tvl || volume) setServerPreloadData(chainId, { pools, tvl, volume })
  }, [setServerPreloadData, chainId, pools, tvl, volume])
  return children
}
