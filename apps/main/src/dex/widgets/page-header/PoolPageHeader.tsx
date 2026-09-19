import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { constQ, fallbackQ, mapQuery } from '@ui/features/queries/util'
import { amount } from '@ui/lib/decimal'

export const PoolPageHeader = ({
  chainId,
  blockchainId,
  poolIdOrAddress,
  title,
  tokenList,
  isLoading,
  pricesApiPoolData,
  backHref,
}: {
  chainId: number
  blockchainId: string
  poolIdOrAddress: string
  title: string | undefined
  tokenList: { symbol: string; address: string }[] | undefined
  isLoading: boolean
  pricesApiPoolData: PricesApiPool | undefined
  backHref?: string
}) => {
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const tvl = usePoolTvl({ chainId, poolId })
  const volume = usePoolVolume({ chainId, poolId })

  return (
    <PoolDetailsHeader
      backHref={backHref}
      title={title}
      tokens={tokenList}
      blockchainId={blockchainId}
      isLoading={isLoading}
      rightItems={
        poolId && (
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
        )
      }
    />
  )
}
