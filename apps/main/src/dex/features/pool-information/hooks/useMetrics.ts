import { usePoolTotalStaked } from '@/dex/queries/pool-total-staked.query'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, fallbackQ, mapQuery } from '@ui/features/queries/util'
import { decimal, decimalPercent } from '@ui/lib/decimal'

export const useMetrics = ({
  chainId,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const staked = usePoolTotalStaked({ chainId, poolId })
  return {
    gaugeTotalSupply: mapQuery(staked, data => decimal(data.gaugeTotalSupply)),
    totalStakedPercent: mapQuery(staked, data => decimal(data.totalStakedPercent)),
    liquidityUtilization: fallbackQ(
      combineQueries([usePoolVolume({ chainId, poolId }), usePoolTvl({ chainId, poolId })], decimalPercent),
      constQ(maybes([pricesApiPoolData?.tradingVolume24h, pricesApiPoolData?.tvlUsd].map(decimal), decimalPercent)),
    ),
  }
}
