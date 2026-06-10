import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { maybe } from '@primitives/objects.utils'

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
  const { data: volumeFromCurve } = usePoolVolume({ chainId, poolId })
  const { data: tvlFromCurve } = usePoolTvl({ chainId, poolId })
  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  const tvl = maybe(tvlFromCurve && pricesApiPoolData?.tvlUsd, x => +x)
  const volume = maybe(volumeFromCurve && pricesApiPoolData?.tradingVolume24h, x => +x)

  return {
    gaugeTotalSupply: maybe(staked?.gaugeTotalSupply, x => +x),
    totalStakedPercent: maybe(staked?.totalStakedPercent, x => +x),
    liquidityUtilization: tvl && volume != null ? (volume / tvl) * 100 : undefined,
  }
}
