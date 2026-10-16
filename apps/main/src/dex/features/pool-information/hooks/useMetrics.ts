import { usePoolTotalStaked } from '@/dex/queries/pool-total-staked.query'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { DEFAULT_DECIMALS, maybe, maybes } from '@primitives/objects.utils'
import type { PoolInformationMetricsProps } from '@ui/features/pools/PoolInformationMetrics'
import { combineQueries, dependentQuery } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimal, decimalPercent, fromWei } from '@ui/lib/decimal'

export const useMetrics = ({
  chainId,
  poolAddress,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolAddress: QueryProp<Address>
  pricesApiPoolData: QueryProp<PricesApiPool>
}): PoolInformationMetricsProps => {
  const staked = dependentQuery(poolAddress, usePoolTotalStaked({ chainId, poolAddress: poolAddress.data }))

  return {
    gaugeTotalSupply: mapQuery(staked, data =>
      maybe(decimal(data.gaugeTotalSupply), supply => fromWei(supply, DEFAULT_DECIMALS)),
    ),
    totalStakedPercent: mapQuery(staked, data => decimal(data.totalStakedPercent)),
    liquidityUtilization: fallbackQ(
      dependentQuery(
        poolAddress,
        combineQueries(
          [
            usePoolVolume({ chainId, poolAddress: poolAddress.data }),
            usePoolTvl({ chainId, poolAddress: poolAddress.data }),
          ],
          decimalPercent,
        ),
      ),
      mapQuery(pricesApiPoolData, pool => maybes([pool.tradingVolume24h, pool.tvlUsd].map(decimal), decimalPercent)),
    ),
  }
}
