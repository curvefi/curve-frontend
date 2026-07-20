import { type Address } from 'viem'
import { formatCryptoA, FXSWAP } from '@/dex/components/PageCreatePool/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { maybe, maybes } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { amount, Chain, formatNumber } from '@ui-kit/utils'
import { Section } from './Section'

const { Spacing } = SizesAndSpaces

export const Parameters = ({
  chainId,
  poolId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolId: string
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const chain = network.networkId as BlockchainId
  const metadata = usePoolMetadata({ chain, poolAddress })
  const parameters = usePoolParameters({ chainId, poolId })
  const snapshots = usePoolSnapshots({ chain, poolAddress })
  const snapshotData = snapshots.data?.[0] // todo: use fallbackQ
  const isFxSwap = metadata.data?.hasDonations ?? false
  const {
    A,
    initial_A,
    initial_A_time,
    virtualPrice,
    future_A,
    future_A_time,
    gamma,
    adminFee = '',
    fee,
  } = parameters.data ?? {}
  const formatADisplay = (a: number | string | undefined) =>
    formatNumber(amount(!isFxSwap || a == null ? a : formatCryptoA(a, FXSWAP)), { abbreviate: false, fallback: '-' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  const isEywaPool = chainId === Chain.Fantom && poolId.startsWith('factory-eywa')

  const rampADetails = maybes([initial_A, future_A_time, future_A], (initial_A, future_A_time, future_A) => ({
    isFutureATimePassedToday: dayjs().isAfter(future_A_time, 'day'),
    isRampUp: Number(future_A) > Number(initial_A),
  }))

  return (
    <Card size="inline">
      <CardHeader title={t`Parameters`} />
      <CardContent component={Stack}>
        <Section>
          <ActionInfo
            label={t`AMM fee`}
            value={mapQuery(parameters, () =>
              formatNumber(amount(fee ?? maybe(snapshotData?.fee, fee => fee / 10 ** 8)), 'percent.value'),
            )}
          />

          <ActionInfo
            label={t`DAO fee`}
            valueTooltip={t`The total fee on each trade is split in two parts: one part goes to the pool's Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
            value={mapQuery(parameters, () =>
              formatNumber(amount(isEywaPool ? +adminFee / 2 : adminFee), 'percent.value'),
            )}
          />

          {isEywaPool && <ActionInfo label={t`EYWA fee`} value={mapQuery(parameters, () => +adminFee / 2)} />}

          <ActionInfo
            label={t`Virtual price`}
            value={mapQuery(parameters, () =>
              formatNumber(amount(virtualPrice ?? maybe(snapshotData?.virtualPrice, x => x / 10 ** 18)), {
                maximumFractionDigits: 8,
                abbreviate: false,
                fallback: '-',
              }),
            )}
            valueTooltip={t`Measures pool growth; this is not a dollar value`}
          />
        </Section>

        <Section>
          {(A != null || snapshotData?.a != null) && (
            <ActionInfo
              label={t`Amplification factor`}
              value={formatADisplay(A ?? snapshotData?.a ?? undefined)}
              valueTooltip={
                <Stack sx={{ gap: Spacing.sm }}>
                  {t`Amplification coefficient chosen from fluctuation of prices around 1.`}
                  {rampADetails?.isFutureATimePassedToday &&
                    maybes(
                      [initial_A_time, future_A_time],
                      (initial_A_time, future_A_time) =>
                        t`Last change occurred between ${formatDate(initial_A_time, 'short')} and ${formatDate(
                          future_A_time,
                          'short',
                        )}, when A ramped from ${formatADisplay(initial_A)} to ${formatADisplay(future_A)}.`,
                    )}
                </Stack>
              }
            />
          )}

          {rampADetails && !rampADetails.isFutureATimePassedToday && (
            <>
              <ActionInfo
                label={t`Ramping ${rampADetails.isRampUp ? 'up' : 'down'} A`}
                valueTooltip={t`Slowly changing ${rampADetails.isRampUp ? 'up' : 'down'} A so that it doesn't negatively change virtual price growth of shares`}
                value={formatADisplay(initial_A)}
                futureValue={formatADisplay(future_A)}
              />
              <ActionInfo label={t`Ramp ends`} value={future_A_time ? formatDate(future_A_time, 'short') : '-'} />
            </>
          )}

          {maybe(snapshotData?.offpegFeeMultiplier, x => (
            <ActionInfo label={t`Off peg multiplier`} value={formatNumber(x / 10 ** 10, 'pool.parameter')} />
          ))}
        </Section>

        <Section>
          {maybe(snapshotData?.midFee, x => (
            <ActionInfo label={t`Mid fee`} value={formatNumber(x / 10 ** 8, 'pool.parameter')} />
          ))}

          {maybe(snapshotData?.outFee, x => (
            <ActionInfo label={t`Out fee`} value={formatNumber(x / 10 ** 8, 'pool.parameter')} />
          ))}
        </Section>

        <Section>
          {gamma && (
            <ActionInfo
              label={t`Gamma`}
              value={formatNumber(amount(gamma), { useGrouping: false, abbreviate: false, fallback: '-' })}
            />
          )}

          {maybe(snapshotData?.feeGamma, x => (
            <ActionInfo label={t`Fee Gamma`} value={formatNumber(x / 10 ** 18, 'pool.parameter')} />
          ))}

          {maybe(snapshotData?.allowedExtraProfit, x => (
            <ActionInfo label={t`Allowed extra profit`} value={formatNumber(x / 10 ** 18, 'pool.parameter')} />
          ))}
        </Section>

        <Section>
          {maybe(snapshotData?.adjustmentStep, x => (
            <ActionInfo label={t`Adjustment step`} value={formatNumber(x / 10 ** 18, 'pool.parameter')} />
          ))}

          {maybe(snapshotData?.maHalfTime, x => (
            <ActionInfo
              label={t`Moving average time`}
              value={formatNumber(x, { useGrouping: false, abbreviate: false })}
            />
          ))}
        </Section>
      </CardContent>
    </Card>
  )
}
