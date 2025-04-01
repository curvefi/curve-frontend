import type { PoolDataCacheMapper, ValueMapperCached } from '@/dex/types/main.types'

export type DexServerSideNetworkCache = {
  pools?: PoolDataCacheMapper
  tvl?: ValueMapperCached
  volume?: ValueMapperCached
}
