import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { useBasePools } from '@/dex/queries/base-pools.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getPoolAddress } from '@/dex/utils'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { combineQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { Section } from './Section'

const getPoolType = ({
  pool,
  tokenCount,
  isFxSwap,
}: {
  isFxSwap: boolean
  tokenCount: number
  pool: PoolDataCacheOrApi['pool']
}) => {
  if (isFxSwap) return t`FXSwap`
  if ('isLlamma' in pool && pool.isLlamma) return 'Llamma'
  if (!pool.isCrypto && !pool.isNg) return t`Stableswap`
  if (!pool.isCrypto && pool.isNg) return t`Stableswap-NG`
  if (pool.isCrypto && !pool.isNg && tokenCount === 2) return t`2-coin Cryptoswap`
  if (pool.isCrypto && !pool.isNg && tokenCount === 3) return t`Tricrypto`
  if (pool.isCrypto && pool.isNg && tokenCount === 2) return t`2-coin Cryptoswap-NG`
  if (pool.isCrypto && pool.isNg && tokenCount === 3) return t`3-coin Cryptoswap-NG`

  return pool.implementation
}

export const Info = ({
  chainId,
  poolQuery,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const poolDataCacheOrApi = poolQuery.data
  const poolId = poolDataCacheOrApi?.pool.id
  const poolAddress = getPoolAddress(poolDataCacheOrApi)
  const { data: network } = useNetworkByChain({ chainId })
  const chain = network.networkId as BlockchainId
  const { data: basePools } = useBasePools({ chainId })
  const metadataQuery = usePoolMetadata({ chain, poolAddress })
  const { data: metadata } = metadataQuery
  const isFxSwap = metadata?.hasDonations ?? false
  const loadingValue = mapQuery(poolQuery, () => undefined)
  const poolType =
    (poolDataCacheOrApi &&
      getPoolType({
        pool: poolDataCacheOrApi.pool,
        isFxSwap,
        tokenCount: metadata?.coins.length ?? poolDataCacheOrApi.tokens.length,
      })) ||
    metadata?.poolType ||
    '-'

  return (
    <Card size="inline">
      <CardHeader title={t`Info`} />
      <CardContent component={Section}>
        <ActionInfo
          label={t`Pool type`}
          value={mapQuery(poolQuery, () =>
            notFalsy(
              poolType,
              metadata?.metapool && `${t`Metapool`}`,
              basePools?.some(pool => pool.pool === poolAddress) && `${t`Basepool`}`,
            ).join(', '),
          )}
        />

        {maybe(metadata?.basePool, x => (
          <AddressActionInfo network={network} title={t`Basepool`} address={x} />
        ))}

        {maybe(metadata?.vyperVersion, x => (
          <ActionInfo label={t`Vyper version`} value={x} />
        ))}

        {poolQuery.isLoading || metadataQuery.isLoading ? (
          <ActionInfo label={t`Registry`} value={combineQueries([poolQuery, metadataQuery], () => undefined)} />
        ) : (
          maybe(metadata?.registry, x => <AddressActionInfo network={network} title={t`Registry`} address={x} />)
        )}
        <ActionInfo label={t`ID`} value={poolId ? mapQuery(poolQuery, ({ pool }) => pool.id) : loadingValue} />
      </CardContent>
    </Card>
  )
}
