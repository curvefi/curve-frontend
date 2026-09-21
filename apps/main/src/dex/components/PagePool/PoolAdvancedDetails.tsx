import { type Address, getAddress, isAddressEqual, zeroAddress } from 'viem'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import { ManagePoolLink } from '@/dex/components/PagePool/components/ManagePoolLink'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { AdvancedDetails } from '@/dex/features/advanced-details'
import { usePoolContext } from '@/dex/features/pool-context'
import { useBasePools } from '@/dex/queries/base-pools.query'
import type { PoolData } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { shortenAddress } from '@evm-ui/utils'
import { scanAddressPath } from '@legacy-ui/utils'
import { t } from '@ui/lib/i18n'

const getPoolType = ({
  pool,
  tokenCount,
  isFxSwap,
}: {
  pool: PoolData['pool']
  tokenCount: number
  isFxSwap: boolean
}) => {
  if (isFxSwap) return t`FXSwap`
  if ('isLlamma' in pool && pool.isLlamma) return 'Llamma'
  if (!pool.isCrypto && !pool.isNg) return t`Stableswap`
  if (!pool.isCrypto && pool.isNg) return t`Stableswap-NG`
  if (pool.isCrypto && !pool.isNg && tokenCount === 2) return t`2-coin Cryptoswap`
  if (pool.isCrypto && !pool.isNg && tokenCount === 3) return t`Tricrypto`
  if (pool.isCrypto && pool.isNg && tokenCount === 2) return t`2-coin Cryptoswap-NG`
  if (pool.isCrypto && pool.isNg && tokenCount === 3) return t`3-coin Cryptoswap-NG`
  return pool.implementation ?? undefined
}

/** EVM integration boundary for the otherwise chain-agnostic advanced-details feature. */
export const PoolAdvancedDetails = () => {
  const {
    chainId,
    blockchainId,
    poolId,
    poolAddress,
    poolData: {
      gauge: { isKilled },
      pool,
      pool: { lpToken, gauge },
      tokens,
    },
  } = usePoolContext()
  const { data: basePools } = useBasePools({ chainId })
  const { data: metadata } = usePoolMetadata({ chain: blockchainId as BlockchainId, poolAddress })

  return (
    <AdvancedDetails
      chainId={chainId}
      poolId={poolId}
      info={{
        poolType: getPoolType({
          pool,
          isFxSwap: metadata?.hasDonations ?? false,
          tokenCount: metadata?.coins.length ?? tokens.length,
        }),
        isMetapool: !!metadata?.metapool,
        isBasePool: basePools?.some(basePool => isAddressEqual(basePool.pool as Address, poolAddress)) ?? false,
        basePoolAddress: metadata?.basePool ? getAddress(metadata.basePool) : undefined,
        registryAddress: metadata?.registry ? getAddress(metadata.registry) : undefined,
        vyperVersion: metadata?.vyperVersion ?? undefined,
      }}
      contracts={{
        poolAddress: getAddress(poolAddress),
        lpTokenAddress: getAddress(lpToken),
        gaugeAddress: getAddress(gauge.address),
        hasGauge: !isAddressEqual(gauge.address as Address, zeroAddress),
        gaugeIsKilled: !!isKilled,
        oracles:
          metadata?.assetTypes?.flatMap((assetType, index) => {
            const oracle = metadata.oracles?.[index]
            if (assetType !== 1 || !oracle?.oracleAddress || isAddressEqual(oracle.oracleAddress, zeroAddress))
              return []
            const symbol = metadata.coins[index]?.symbol
            return [
              { address: getAddress(oracle.oracleAddress), title: symbol ? `${symbol} Oracle` : `Oracle ${index + 1}` },
            ]
          }) ?? [],
      }}
      formatAddress={shortenAddress}
      scanAddressPath={scanAddressPath}
      managePoolLink={<ManagePoolLink chainId={chainId} poolAddress={getAddress(poolAddress)} />}
      addGaugeLink={<AddGaugeLink />}
    />
  )
}
