import { asAddress, stellarAddressDisplay } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { usePoolInfo } from '@/stellar/queries/pool/pool-info.query'
import { usePoolSnapshot } from '@/stellar/queries/pool/pool-snapshot.query'
import { usePoolVirtualPrice } from '@/stellar/queries/pool/pool-virtual-price.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import type { LitePool } from '@curvefi/prices-api/pools'
import { formatNumber } from '@primitives/number.utils'
import { maybes, notFalsy } from '@primitives/objects.utils'
import { AdvancedDetails } from '@ui/features/pool/advanced-details/AdvancedDetails'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { constQ, fallbackQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'

const hasRampFinished = (futureATime: number, currentDate: Date) => futureATime <= currentDate.valueOf()

export const PoolAdvancedDetails = ({
  network,
  pool,
  tokens,
  litePool,
}: PoolQuery & { tokens: QueryProp<PoolToken>[] | undefined; litePool: QueryProp<LitePool | null> }) => {
  const currentDate = useCurrentDate()
  const params = { network, pool }
  const { data: info, isLoading: isInfoLoading } = usePoolInfo(params)
  const snapshotQuery = usePoolSnapshot(params)
  const { data: snapshot, isLoading: isSnapshotLoading } = snapshotQuery
  const { coins: tokenAddresses } = info ?? {}
  const { A, initial_A, future_A, initial_A_time, future_A_time, isRampUp, offpegFeeMultiplier } = snapshot ?? {}

  const tokenSymbols = tokens?.map(({ data }, index) => data?.symbol ?? t`Token ${index + 1}`)
  return (
    <AdvancedDetails
      chainId={STELLAR_NETWORKS[network].chainId}
      isLoading={isInfoLoading || isSnapshotLoading}
      info={{
        poolType: fallbackQ(
          mapQuery(litePool, pool => notFalsy(t`Stableswap`, pool?.isMetaPool && t`Metapool`).join(', ')),
          constQ(t`Stableswap`),
        ),
      }}
      contracts={{ poolAddress: asAddress(pool), lpTokenAddress: asAddress(pool) }}
      prices={{ tokenSymbols, tokenAddresses: tokenAddresses?.map(asAddress) }}
      parameters={{
        A,
        offpegFeeMultiplier,
        initial_A,
        initial_A_time,
        future_A,
        future_A_time,
        formatADisplay: value => formatNumber(value, 'pool.parameter'),
        rampADetails: maybes([future_A_time, isRampUp], (futureATime, isRampUp) => ({
          isFutureATimePassedToday: hasRampFinished(futureATime, currentDate),
          isRampUp,
        })),
        ammFee: mapQuery(snapshotQuery, ({ ammFee }) => ammFee),
        daoFee: mapQuery(snapshotQuery, ({ daoFee }) => daoFee),
        virtualPrice: q(usePoolVirtualPrice(params)),
      }}
      addressDisplay={stellarAddressDisplay}
    />
  )
}
