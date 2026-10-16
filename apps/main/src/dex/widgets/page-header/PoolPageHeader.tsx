import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { constQ, fallbackQ, mapQuery, type QueryProp } from '@ui/features/queries/util'
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
  poolAddress: Address
  title: QueryProp<string>
  tokens: QueryProp<{ symbol: string | undefined; address: Address }>[] | undefined
  pricesApiPoolData: PricesApiPool | undefined
  backHref: string
}) => {
  const tvl = usePoolTvl({ chainId, poolAddress })
  const volume = usePoolVolume({ chainId, poolAddress })

  return (
    <PoolDetailsHeader
      backHref={backHref}
      title={title}
      tokens={tokens}
      blockchainId={blockchainId}
      rightItems={
        <PoolHeaderMetrics
          tvl={fallbackQ(
            mapQuery(tvl, data => amount(data)),
            constQ(amount(pricesApiPoolData?.tvlUsd)),
          )}
          volume24h={fallbackQ(
            mapQuery(volume, data => amount(data)),
            constQ(amount(pricesApiPoolData?.tradingVolume24h)),
          )}
        />
      }
    />
  )
}
