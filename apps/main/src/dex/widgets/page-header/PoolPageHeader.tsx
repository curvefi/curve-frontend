import { useMemo } from 'react'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { PageHeader } from '@evm-ui/widgets/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { t } from '@ui/lib/i18n'
import { PoolMetricsRow } from './PoolMetricsRow'

const ICON_SIZE = 35

const getPoolTokens = (poolDataCacheOrApi: PoolDataCacheOrApi | undefined) =>
  poolDataCacheOrApi?.tokens
    .map((symbol, index) => ({ symbol, address: poolDataCacheOrApi.tokenAddresses[index] ?? '' }))
    .filter(({ address }) => address) ?? []

export const PoolPageHeader = ({
  chainId,
  blockchainId,
  poolIdOrAddress,
  backHref,
  pricesApiPoolData,
}: {
  chainId: ChainId
  blockchainId: string
  poolIdOrAddress: string
  backHref?: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const poolData = useStore(state => (poolId ? state.pools.poolsMapper[chainId]?.[poolId] : undefined))
  const poolDataCache = useStore(state => (poolId ? state.storeCache.poolsMapper[chainId]?.[poolId] : undefined))
  const poolDataCacheOrApi = poolData ?? poolDataCache

  const isLoading = !poolDataCacheOrApi

  const tokenList = useMemo(() => getPoolTokens(poolDataCacheOrApi), [poolDataCacheOrApi])
  const subtitle = tokenList?.map(({ symbol }) => symbol).join(' / ')

  return (
    <PageHeader
      backHref={backHref}
      title={poolDataCacheOrApi?.pool.name ?? 'Pool'}
      titleLoading={isLoading}
      subtitle={subtitle ?? (isLoading ? t`Token symbols` : undefined)}
      subtitleLoading={isLoading}
      icon={
        (isLoading || tokenList.length > 0) && (
          <WithSkeleton loading={isLoading} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
            <TokenIcons blockchainId={blockchainId} tokens={tokenList} overflowMode="stack" />
          </WithSkeleton>
        )
      }
      rightItems={poolId && <PoolMetricsRow chainId={chainId} poolId={poolId} pricesApiPoolData={pricesApiPoolData} />}
    />
  )
}
