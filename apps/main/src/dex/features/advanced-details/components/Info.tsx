import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { useBasePools } from '@/dex/queries/base-pools.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { fakeLoadingQ } from '@ui-kit/types/util'
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
  poolId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolId: string
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const { pool } = poolDataCacheOrApi
  const poolAddress = pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const chain = network.networkId as BlockchainId
  const { data: basePools } = useBasePools({ chainId })
  const { data: metadata } = usePoolMetadata({ chain, poolAddress })
  const isFxSwap = metadata?.hasDonations ?? false
  const poolType =
    getPoolType({ pool, isFxSwap, tokenCount: metadata?.coins.length ?? poolDataCacheOrApi.tokens.length }) ||
    metadata?.poolType ||
    '-'

  return (
    <Card size="inline">
      <CardHeader title={t`Info`} />
      <CardContent component={Section}>
        <ActionInfo
          label={t`Pool type`}
          value={notFalsy(
            poolType,
            metadata?.metapool && `${t`Metapool`}`,
            basePools?.some(pool => pool.pool === poolAddress) && `${t`Basepool`}`,
          ).join(', ')}
        />

        {maybe(metadata?.basePool, x => (
          <AddressActionInfo network={network} title={t`Basepool`} address={x} />
        ))}

        {maybe(metadata?.vyperVersion, x => (
          <ActionInfo label={t`Vyper version`} value={x} />
        ))}

        {maybe(metadata?.registry, x => (
          <AddressActionInfo network={network} title={t`Registry`} address={x} />
        ))}
        <ActionInfo label={t`ID`} value={fakeLoadingQ(poolId)} />
      </CardContent>
    </Card>
  )
}
