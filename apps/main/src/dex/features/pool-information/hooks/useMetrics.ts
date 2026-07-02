import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui-kit/lib'
import { constQ, fallbackQ } from '@ui-kit/types/util'
import { decimal, decimalPercent } from '@ui-kit/utils'

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
  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  return {
    gaugeTotalSupply: constQ(decimal(staked?.gaugeTotalSupply)),
    totalStakedPercent: constQ(decimal(staked?.totalStakedPercent)),
    liquidityUtilization: fallbackQ(
      combineQueries([usePoolTvl({ chainId, poolId }), usePoolVolume({ chainId, poolId })], decimalPercent),
      constQ(maybes([pricesApiPoolData?.tvlUsd, pricesApiPoolData?.tradingVolume24h].map(decimal), decimalPercent)),
    ),
  }
}
