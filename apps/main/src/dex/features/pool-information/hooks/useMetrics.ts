import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui-kit/lib'
import { constQ, fallbackQ, mapQuery } from '@ui-kit/types/util'

export const useMetrics = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const volumeFromCurve = usePoolVolume({ chainId, poolId })
  const tvlFromCurve = usePoolTvl({ chainId, poolId })
  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  const tvl = fallbackQ(
    mapQuery(tvlFromCurve, data => +data),
    constQ(maybe(pricesApiPoolData?.tvlUsd, x => +x)),
  )
  const volume = fallbackQ(
    mapQuery(volumeFromCurve, data => +data),
    constQ(maybe(pricesApiPoolData?.tradingVolume24h, x => +x)),
  )

  return {
    gaugeTotalSupply: constQ(maybe(staked?.gaugeTotalSupply, x => +x)),
    totalStakedPercent: constQ(maybe(staked?.totalStakedPercent, x => +x)),
    liquidityUtilization: combineQueries([tvl, volume], (tvl, volume) => tvl && (volume / tvl) * 100),
  }
}
