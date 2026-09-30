import { asAddress, stellarAddressDisplay } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { usePoolA } from '@/stellar/queries/pool/pool-a.query'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolVirtualPrice } from '@/stellar/queries/pool/pool-virtual-price.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { formatNumber } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { AdvancedDetails } from '@ui/features/pool/advanced-details/AdvancedDetails'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

const FEE_DECIMALS = 10

const hasRampFinished = (futureATime: number, currentDate: Date) => futureATime < currentDate.valueOf()

export const PoolAdvancedDetails = ({ network, pool, tokens }: PoolQuery & { tokens: QueryProp<PoolToken[]> }) => {
  const currentDate = useCurrentDate()
  const params = { network, pool }
  const a = usePoolA(params)
  const config = usePoolConfig(params)

  const {
    future_a,
    future_a_time,
    initial_a,
    initial_a_time,
    offpeg_fee_multiplier,
    tokens: tokenAddresses,
  } = config.data ?? {}
  const futureATime = maybe(future_a_time, future_a_time => Number(future_a_time) * 1000)
  const initialATime = maybe(initial_a_time, initial_a_time => Number(initial_a_time) * 1000)

  const tokenSymbols = tokens.data?.map(({ symbol }, index) => symbol ?? t`Token ${index + 1}`)
  return (
    <AdvancedDetails
      chainId={STELLAR_NETWORKS[network].chainId}
      info={{ poolType: t`Stableswap` }}
      contracts={{ poolAddress: asAddress(pool), lpTokenAddress: asAddress(pool) }}
      prices={{ tokenSymbols, tokenAddresses: tokenAddresses?.map(asAddress) }}
      parameters={{
        a: a.data,
        offpegFeeMultiplier: maybe(offpeg_fee_multiplier, Number),
        initial_A: maybe(initial_a, initialA => fromWei(initialA, 2)),
        initial_A_time: initialATime,
        future_A: maybe(future_a, futureA => fromWei(futureA, 2)),
        future_A_time: futureATime,
        formatADisplay: value => formatNumber(value, 'pool.parameter'),
        rampADetails: maybes([futureATime, future_a, initial_a], (futureATime, future_a, initial_a) => ({
          isFutureATimePassedToday: hasRampFinished(futureATime, currentDate),
          isRampUp: future_a > initial_a,
        })),
        ammFee: mapQuery(config, ({ fee }) => fromWei(fee, FEE_DECIMALS)),
        daoFee: mapQuery(config, ({ admin_fee }) => fromWei(admin_fee, FEE_DECIMALS)),
        virtualPrice: q(usePoolVirtualPrice(params)),
      }}
      addressDisplay={stellarAddressDisplay}
    />
  )
}
