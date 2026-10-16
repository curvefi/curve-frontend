import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, type QueryProp } from '@ui/features/queries/util'
import { amount } from '@ui/lib/decimal'

export const PoolPageHeader = ({
  chainId,
  blockchainId,
  poolAddress,
  title,
  tokens,
  pricesApiPoolData,
  backHref,
}: {
  chainId: number
  blockchainId: string
  poolAddress: QueryProp<Address>
  title: QueryProp<string>
  tokens: QueryProp<{ symbol: string; address: Address }>[] | undefined
  pricesApiPoolData: QueryProp<PricesApiPool>
  backHref: string
}) => {
  const tvl = usePoolTvl({ chainId, poolAddress: poolAddress.data })
  const volume = usePoolVolume({ chainId, poolAddress: poolAddress.data })

  return (
    <PoolDetailsHeader
      backHref={backHref}
      title={title}
      tokens={tokens}
      blockchainId={blockchainId}
      rightItems={
        <PoolHeaderMetrics
          tvl={fallbackQ(
            combineQueries([poolAddress, tvl], (_, data) => amount(data)),
            mapQuery(pricesApiPoolData, pool => amount(pool.tvlUsd)),
          )}
          volume24h={fallbackQ(
            combineQueries([poolAddress, volume], (_, data) => amount(data)),
            mapQuery(pricesApiPoolData, pool => amount(pool.tradingVolume24h)),
          )}
        />
      }
    />
  )
}
