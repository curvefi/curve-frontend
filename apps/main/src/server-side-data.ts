import type { PoolDataCacheMapper, ValueMapperCached } from '@/dex/types/main.types'

export const DexServerSideCache: Record<
  string,
  {
    pools?: PoolDataCacheMapper
    tvl?: ValueMapperCached
    volume?: ValueMapperCached
  }
> = {}
