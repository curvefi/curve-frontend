import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { combineQueries } from '@evm-ui/lib'
import { constQ, fallbackQ, mapQuery, type QueryProp } from '@evm-ui/types/util'
import { decimal, decimalPercent } from '@evm-ui/utils'
import { maybes } from '@primitives/objects.utils'

export const useMetrics = ({
  chainId,
  poolQuery,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
  pricesApiPoolData?: PricesApiPool
}) => {
  const poolId = poolQuery.data?.pool.id
  const staked = usePoolTotalStaked(poolQuery.data)
  const volume = usePoolVolume({ chainId, poolId })
  const tvl = usePoolTvl({ chainId, poolId })

  return {
    gaugeTotalSupply: combineQueries([poolQuery, constQ(decimal(staked?.gaugeTotalSupply))], (_pool, supply) => supply),
    totalStakedPercent: combineQueries(
      [poolQuery, constQ(decimal(staked?.totalStakedPercent))],
      (_pool, percent) => percent,
    ),
    liquidityUtilization: fallbackQ(
      combineQueries([poolQuery, volume, tvl], (_pool, volume, tvl) => decimalPercent(volume, tvl)),
      mapQuery(poolQuery, () =>
        maybes([pricesApiPoolData?.tradingVolume24h, pricesApiPoolData?.tvlUsd].map(decimal), decimalPercent),
      ),
    ),
  }
}
