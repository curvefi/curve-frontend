import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId, PoolData } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { combineQueries } from '@evm-ui/lib'
import { decimal, decimalPercent } from '@evm-ui/utils'
import { maybes } from '@primitives/objects.utils'
import { constQ, fallbackQ } from '@ui/features/queries/util'

export const useMetrics = ({
  chainId,
  poolData,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolData: PoolData
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const staked = usePoolTotalStaked(poolData)
  return {
    gaugeTotalSupply: constQ(decimal(staked?.gaugeTotalSupply)),
    totalStakedPercent: constQ(decimal(staked?.totalStakedPercent)),
    liquidityUtilization: fallbackQ(
      combineQueries([usePoolVolume({ chainId, poolId }), usePoolTvl({ chainId, poolId })], decimalPercent),
      constQ(maybes([pricesApiPoolData?.tradingVolume24h, pricesApiPoolData?.tvlUsd].map(decimal), decimalPercent)),
    ),
  }
}
