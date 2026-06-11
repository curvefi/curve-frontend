import { useMemo } from 'react'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { PageHeader } from '@ui-kit/widgets/PageHeader'
import { PoolMetricsRow } from './PoolMetricsRow'

const ICON_SIZE = 35

const getPoolTitle = (poolName: string | undefined, poolIdOrAddress: string | undefined) => {
  const trimmedName = poolName?.trim()
  const colonIndex = trimmedName?.lastIndexOf(':') ?? -1
  const title = colonIndex >= 0 ? trimmedName?.slice(colonIndex + 1).trim() : trimmedName

  return title || poolIdOrAddress || t`Pool`
}

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
  const subtitle = tokenList.length ? tokenList.map(({ symbol }) => symbol).join(' / ') : undefined

  return (
    <PageHeader
      backHref={backHref}
      title={getPoolTitle(poolDataCacheOrApi?.pool.name, poolIdOrAddress)}
      titleLoading={isLoading}
      subtitle={subtitle ?? (isLoading ? t`Token symbols` : undefined)}
      subtitleLoading={isLoading}
      icon={
        (isLoading || tokenList.length > 0) && (
          <WithSkeleton loading={isLoading} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
            {tokenList.length === 2 ? (
              <TokenPair
                chain={blockchainId}
                assets={{ primary: tokenList[0], secondary: tokenList[1] }}
                hideChainIcon
              />
            ) : (
              <TokenIcons blockchainId={blockchainId} tokens={tokenList} />
            )}
          </WithSkeleton>
        )
      }
      rightItems={poolId && <PoolMetricsRow chainId={chainId} poolId={poolId} pricesApiPoolData={pricesApiPoolData} />}
    />
  )
}
