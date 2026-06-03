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

  return {
    gaugeTotalSupply: maybe(staked?.gaugeTotalSupply, x => +x),
    totalStakedPercent: maybe(staked?.totalStakedPercent, x => +x),
    tvl: maybe(pricesApiPoolData?.tvlUsd ?? tvlFromCurve, x => +x),
    volume: maybe(pricesApiPoolData?.tradingVolume24h ?? volumeFromCurve, x => +x),
  }
}
