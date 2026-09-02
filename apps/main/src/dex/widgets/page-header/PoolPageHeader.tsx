import { useMemo } from 'react'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { t } from '@evm-ui/lib/i18n'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { fakeLoadingQ, type QueryProp } from '@evm-ui/types/util'
import { PageHeader } from '@evm-ui/widgets/PageHeader'
import { notFalsy } from '@primitives/objects.utils'
import { PoolMetricsRow } from './PoolMetricsRow'

const ICON_SIZE = 35

const getPoolTokens = (poolDataCacheOrApi: PoolDataCacheOrApi | undefined) =>
  poolDataCacheOrApi?.tokens.flatMap((symbol, index) => {
    const address = poolDataCacheOrApi.tokenAddresses[index]
    return notFalsy(address && { symbol, address })
  })

export const PoolPageHeader = ({
  chainId,
  blockchainId,
  poolQuery,
  poolIdOrAddress,
  backHref,
  pricesApiPoolData,
}: {
  chainId: ChainId
  blockchainId: string
  poolQuery?: QueryProp<PoolDataCacheOrApi | undefined>
  poolIdOrAddress?: string
  backHref?: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const poolData = useStore(state => (poolId ? state.pools.poolsMapper[chainId]?.[poolId] : undefined))
  const poolDataCache = useStore(state => (poolId ? state.storeCache.poolsMapper[chainId]?.[poolId] : undefined))
  const resolvedPoolQuery = poolQuery ?? fakeLoadingQ(poolData ?? poolDataCache)
  const poolDataCacheOrApi = resolvedPoolQuery.data

  const tokenList = useMemo(() => getPoolTokens(poolDataCacheOrApi), [poolDataCacheOrApi])
  const subtitle = tokenList?.map(({ symbol }) => symbol).join(' / ')

  return (
    <PageHeader
      backHref={backHref}
      title={poolDataCacheOrApi?.pool.name ?? 'Pool'}
      titleLoading={resolvedPoolQuery.isLoading}
      subtitle={subtitle ?? (resolvedPoolQuery.isLoading ? t`Token symbols` : undefined)}
      subtitleLoading={resolvedPoolQuery.isLoading}
      icon={
        (resolvedPoolQuery.isLoading || tokenList?.length) && (
          <WithSkeleton
            loading={resolvedPoolQuery.isLoading}
            variant="rectangular"
            width={ICON_SIZE}
            height={ICON_SIZE}
          >
            {tokenList && <TokenIcons blockchainId={blockchainId} tokens={tokenList} overflowMode="stack" />}
          </WithSkeleton>
        )
      }
      rightItems={
        (resolvedPoolQuery.isLoading || poolDataCacheOrApi) && (
          <PoolMetricsRow chainId={chainId} poolQuery={resolvedPoolQuery} pricesApiPoolData={pricesApiPoolData} />
        )
      }
    />
  )
}
