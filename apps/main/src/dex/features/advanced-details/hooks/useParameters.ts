import { type Address } from 'viem'
import { formatCryptoA, FXSWAP } from '@/dex/components/PageCreatePool/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { useBasePools } from '@/dex/queries/base-pools.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { t } from '@ui-kit/lib/i18n'
import { amount, Chain, formatNumber } from '@ui-kit/utils'

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

export const useParameters = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
}) => {
  const { pool } = poolDataCacheOrApi
  const poolAddress = pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const chain = network.networkId as BlockchainId
  const { data: basePools } = useBasePools({ chainId })
  const { data: metadata } = usePoolMetadata({ chain, poolAddress })
  const { data: parameters, isLoading: isLoadingParameters } = usePoolParameters({ chainId, poolId })
  const { data: snapshots } = usePoolSnapshots({ chain, poolAddress })
  const isFxSwap = metadata?.hasDonations ?? false

  const {
    A,
    initial_A,
    initial_A_time,
    future_A,
    future_A_time,
    virtualPrice,
    gamma,
    adminFee = '',
    fee,
  } = parameters ?? {}

  return {
    A,
    adminFee,
    basePools,
    fee,
    formatADisplay: (a: number | string | undefined) =>
      formatNumber(amount(!isFxSwap || a == null ? a : formatCryptoA(a, FXSWAP)), { abbreviate: false, fallback: '-' }),
    future_A,
    future_A_time,
    gamma,
    initial_A,
    initial_A_time,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    isEywaPool: chainId === Chain.Fantom && poolId.startsWith('factory-eywa'),
    isLoadingParameters,
    metadata,
    network,
    poolAddress,
    poolId,
    poolType:
      getPoolType({ pool, isFxSwap, tokenCount: metadata?.coins.length ?? poolDataCacheOrApi.tokens.length }) ||
      metadata?.poolType ||
      '-',
    snapshotData: snapshots?.[0],
    virtualPrice,
  }
}
