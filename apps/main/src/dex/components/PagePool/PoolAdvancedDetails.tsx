import { type Address, getAddress, isAddressEqual, zeroAddress } from 'viem'
import { formatCryptoA, FXSWAP } from '@/dex/components/PageCreatePool/constants'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import { ManagePoolLink } from '@/dex/components/PagePool/components/ManagePoolLink'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { AdvancedDetails } from '@/dex/features/advanced-details'
import { usePoolContext } from '@/dex/features/pool-context'
import { useBasePools } from '@/dex/queries/base-pools.query'
import { usePoolGaugeStatus } from '@/dex/queries/pool-gauge-status.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import type { PoolData } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { dayjs } from '@evm-ui/lib/dayjs'
import { evmAddressDisplay } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { fallbackQ, mapQuery } from '@ui/features/queries/util'
import { amount, decimal } from '@ui/lib/decimal'
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
      tokenAddresses,
      pool,
      pool: { lpToken, gauge },
      tokens,
    },
  } = usePoolContext()
  const basePools = useBasePools({ chainId })
  const metadata = usePoolMetadata({ chain: blockchainId as BlockchainId, poolAddress })
  const parameters = usePoolParameters({ chainId, poolId })
  const { data: gaugeStatus } = usePoolGaugeStatus({ chainId, poolId })
  const snapshots = usePoolSnapshots({ chain: blockchainId as BlockchainId, poolAddress })
  const {
    priceOracle: priceOracleApi,
    priceScale: priceScaleApi,
    xcpProfit,
    xcpProfitA,
    a,
    adjustmentStep,
    allowedExtraProfit,
    feeGamma,
    maHalfTime,
    midFee,
    offpegFeeMultiplier,
    outFee,
  } = snapshots.data?.[0] ?? {}
  const { priceOracle, priceScale, A, initial_A, initial_A_time, future_A, future_A_time } = parameters.data ?? {}
  const { assetTypes, basePool, coins, hasDonations, metapool, oracles, registry, vyperVersion } = metadata.data ?? {}
  const isFxSwap = hasDonations ?? false
  const isEywaPool = chainId === +Chain.Fantom && poolId.startsWith('factory-eywa')

  return (
    <AdvancedDetails
      chainId={chainId}
      poolId={poolId}
      info={{
        poolType: getPoolType({ pool, isFxSwap: hasDonations ?? false, tokenCount: coins?.length ?? tokens.length }),
        isMetapool: metapool,
        isBasePool: basePools.data?.some(basePool => isAddressEqual(basePool.pool as Address, poolAddress)),
        basePoolAddress: maybe(basePool, getAddress),
        registryAddress: maybe(registry, getAddress),
        vyperVersion,
      }}
      contracts={{
        poolAddress: getAddress(poolAddress),
        lpTokenAddress: getAddress(lpToken),
        gaugeAddress: getAddress(gauge.address),
        hasGauge: !isAddressEqual(gauge.address as Address, zeroAddress),
        gaugeIsKilled: gaugeStatus?.isKilled,
        oracles: assetTypes?.flatMap((assetType, index) => {
          const oracle = oracles?.[index]
          if (assetType !== 1 || !oracle?.oracleAddress || isAddressEqual(oracle.oracleAddress, zeroAddress)) return []
          const symbol = coins?.[index]?.symbol
          const title = symbol ? `${symbol} Oracle` : `Oracle ${index + 1}`
          return [{ address: getAddress(oracle.oracleAddress), title }]
        }),
      }}
      prices={{
        tokens,
        tokenAddresses: tokenAddresses.map(getAddress),
        // Prices API snapshot values are 1e18-scaled, while pool parameters are already human-scale.
        priceOracleData: priceOracle?.length
          ? (priceOracle as Decimal[])
          : priceOracleApi?.map(price => price / 10 ** 18),
        priceScaleData: priceScale?.length ? (priceScale as Decimal[]) : priceScaleApi?.map(price => price / 10 ** 18),
        xcpProfit,
        xcpProfitA,
      }}
      parameters={{
        a,
        adjustmentStep,
        allowedExtraProfit,
        feeGamma,
        maHalfTime,
        midFee,
        offpegFeeMultiplier,
        outFee,
        A: A as Decimal,
        initial_A: initial_A as Decimal,
        initial_A_time,
        future_A: future_A as Decimal,
        future_A_time,
        formatADisplay: a =>
          formatNumber(amount(!isFxSwap || a == null ? a : formatCryptoA(a, FXSWAP)), {
            abbreviate: false,
            fallback: '-',
          }),
        rampADetails: maybes([initial_A, future_A_time, future_A], (initial_A, future_A_time, future_A) => ({
          isFutureATimePassedToday: dayjs().isAfter(future_A_time, 'day'),
          isRampUp: Number(future_A) > Number(initial_A),
        })),
        ammFee: fallbackQ(
          mapQuery(parameters, ({ fee }) => decimal(fee)),
          mapQuery(snapshots, ([snapshot]) => maybe(snapshot?.fee, fee => fee / 10 ** 8)),
        ),
        daoFee: mapQuery(parameters, ({ adminFee }) => amount(isEywaPool ? +adminFee / 2 : adminFee)),
        eywaFee: mapQuery(parameters, ({ adminFee }) => (isEywaPool ? +adminFee / 2 : null)),
        virtualPrice: fallbackQ(
          mapQuery(parameters, ({ virtualPrice }) => decimal(virtualPrice)),
          mapQuery(snapshots, ([snapshot]) => maybe(snapshot?.virtualPrice, value => value / 10 ** 18)),
        ),
        gamma: amount(parameters.data?.gamma),
      }}
      addressDisplay={evmAddressDisplay}
      managePoolLink={<ManagePoolLink chainId={chainId} poolAddress={getAddress(poolAddress)} />}
      addGaugeLink={<AddGaugeLink />}
    />
  )
}
