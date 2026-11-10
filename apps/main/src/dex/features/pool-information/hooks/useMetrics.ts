import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTotalStaked } from '@/dex/queries/pool-total-staked.query'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import { DEFAULT_DECIMALS, maybe, maybes } from '@primitives/objects.utils'
import type { PoolInformationMetricsProps } from '@ui/features/pools/PoolInformationMetrics'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery } from '@ui/features/queries/util'
import { decimal, decimalPercent, fromWei } from '@ui/lib/decimal'

export const useMetrics = (): PoolInformationMetricsProps => {
  const { chainId, poolAddress, apiPool } = usePoolContext()
  const staked = usePoolTotalStaked({ chainId, poolAddress })

  return {
    gaugeTotalSupply: mapQuery(staked, data =>
      maybe(decimal(data.gaugeTotalSupply), supply => fromWei(supply, DEFAULT_DECIMALS)),
    ),
    totalStakedPercent: mapQuery(staked, data => decimal(data.totalStakedPercent)),
    liquidityUtilization: fallbackQ(
      combineQueries([usePoolVolume({ chainId, poolAddress }), usePoolTvl({ chainId, poolAddress })], decimalPercent),
      mapQuery(apiPool, pool => maybes([pool.tradingVolume24h, pool.tvlUsd].map(decimal), decimalPercent)),
    ),
  }
}
