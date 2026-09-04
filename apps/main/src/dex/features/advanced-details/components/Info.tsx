import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { useBasePools } from '@/dex/queries/base-pools.query'
import type { PoolData } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { fakeLoadingQ } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { usePoolContext } from '../../pool-context'
import { Section } from './Section'

const getPoolType = ({
  pool,
  tokenCount,
  isFxSwap,
}: {
  isFxSwap: boolean
  tokenCount: number
  pool: PoolData['pool']
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

export const Info = () => {
  const {
    chainId,
    blockchainId,
    poolId,
    poolAddress,
    poolData: { pool, tokens },
  } = usePoolContext()
  const { data: basePools } = useBasePools({ chainId })
  const { data: metadata } = usePoolMetadata({ chain: blockchainId as BlockchainId, poolAddress })
  const isFxSwap = metadata?.hasDonations ?? false
  const poolType =
    getPoolType({ pool, isFxSwap, tokenCount: metadata?.coins.length ?? tokens.length }) || metadata?.poolType || '-'

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
          <AddressActionInfo chainId={chainId} title={t`Basepool`} address={x} />
        ))}

        {maybe(metadata?.vyperVersion, x => (
          <ActionInfo label={t`Vyper version`} value={x} />
        ))}

        {maybe(metadata?.registry, x => (
          <AddressActionInfo chainId={chainId} title={t`Registry`} address={x} />
        ))}
        <ActionInfo label={t`ID`} value={fakeLoadingQ(poolId)} />
      </CardContent>
    </Card>
  )
}
