import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { amount, formatNumber } from '@ui-kit/utils'
import { useParameters } from '../hooks/useParameters'

const { Spacing } = SizesAndSpaces

const formatParam = (number: number) => formatNumber(number, { decimals: 5, abbreviate: false })

export const Parameters = ({
  chainId,
  poolId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolId: string
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const {
    A,
    adminFee,
    basePools,
    fee,
    formatADisplay,
    future_A,
    future_A_time,
    gamma,
    initial_A,
    initial_A_time,
    isEywaPool,
    isLoadingParameters,
    metadata,
    network,
    poolAddress,
    poolType,
    snapshotData,
    virtualPrice,
  } = useParameters({ chainId, poolDataCacheOrApi, poolId })

  const rampADetails = maybes([initial_A, future_A_time, future_A], ([initial_A, future_A_time, future_A]) => ({
    isFutureATimePassedToday: dayjs().isAfter(future_A_time, 'day'),
    isRampUp: Number(future_A) > Number(initial_A),
  }))

  return (
    <Card size="inline">
      <CardHeader title={t`Parameters`} />
      <CardContent component={Stack}>
        <Stack sx={{ paddingBlock: Spacing.sm }}>
          <ActionInfo
            label={t`AMM fee`}
            loading={isLoadingParameters}
            value={formatNumber(amount(fee ?? snapshotData?.fee), {
              maximumFractionDigits: 4,
              unit: 'percentage',
              abbreviate: false,
              fallback: '-',
            })}
          />

          <ActionInfo
            label={t`DAO fee`}
            loading={isLoadingParameters}
            valueTooltip={t`The total fee on each trade is split in two parts: one part goes to the pool's Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
            value={formatNumber(amount(isEywaPool ? +adminFee / 2 : adminFee), {
              maximumFractionDigits: 4,
              unit: 'percentage',
              abbreviate: false,
              fallback: '-',
            })}
          />

          {isEywaPool && <ActionInfo label={t`EYWA fee`} loading={isLoadingParameters} value={+adminFee / 2} />}

          <ActionInfo
            label={t`Virtual price`}
            loading={isLoadingParameters}
            value={formatNumber(amount(virtualPrice ?? maybe(snapshotData?.virtualPrice, x => x / 10 ** 18)), {
              maximumFractionDigits: 8,
              abbreviate: false,
              fallback: '-',
            })}
            valueTooltip={t`Measures pool growth; this is not a dollar value`}
          />
        </Stack>

        <Stack sx={{ paddingBlock: Spacing.sm }}>
          {maybe(snapshotData?.midFee, x => (
            <ActionInfo label={t`Mid fee`} value={formatParam(x / 10 ** 8)} />
          ))}

          {maybe(snapshotData?.outFee, x => (
            <ActionInfo label={t`Out fee`} value={formatParam(x / 10 ** 8)} />
          ))}

          {(A != null || snapshotData?.a != null) && (
            <ActionInfo
              label={t`A factor`}
              value={formatADisplay(A ?? snapshotData?.a ?? undefined)}
              valueTooltip={
                <Stack sx={{ gap: Spacing.sm }}>
                  {t`Amplification coefficient chosen from fluctuation of prices around 1.`}
                  {rampADetails?.isFutureATimePassedToday &&
                    maybes(
                      [initial_A_time, future_A_time],
                      ([initial_A_time, future_A_time]) =>
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
                prevValue={formatADisplay(initial_A)}
                value={formatADisplay(future_A)}
              />
              <ActionInfo label={t`Ramp ends`} value={future_A_time ? formatDate(future_A_time, 'short') : '-'} />
            </>
          )}

          {maybe(snapshotData?.offpegFeeMultiplier, x => (
            <ActionInfo label={t`Off Peg Multiplier`} value={formatParam(x / 10 ** 10)} />
          ))}

          {gamma && (
            <ActionInfo
              label={t`Gamma`}
              value={formatNumber(amount(gamma), { useGrouping: false, abbreviate: false, fallback: '-' })}
            />
          )}

          {maybe(snapshotData?.allowedExtraProfit, x => (
            <ActionInfo label={t`Allowed Extra Profit`} value={formatParam(x / 10 ** 18)} />
          ))}

          {maybe(snapshotData?.feeGamma, x => (
            <ActionInfo label={t`Fee Gamma`} value={formatParam(x / 10 ** 18)} />
          ))}

          {maybe(snapshotData?.adjustmentStep, x => (
            <ActionInfo label={t`Adjustment Step`} value={formatParam(x / 10 ** 18)} />
          ))}

          {maybe(snapshotData?.maHalfTime, x => (
            <ActionInfo
              label={t`Moving Average Time`}
              value={formatNumber(x, { useGrouping: false, abbreviate: false })}
            />
          ))}
        </Stack>

        <Stack sx={{ paddingBlock: Spacing.sm }}>
          <ActionInfo
            label={t`Pool type`}
            value={notFalsy(
              poolType,
              metadata?.metapool && `${t`Metapool`}`,
              basePools?.some(pool => pool.pool === poolAddress) && `, ${t`Basepool`}`,
            ).join(', ')}
          />

          {maybe(metadata?.basePool, x => (
            <AddressActionInfo network={network} title={t`Basepool`} address={x} />
          ))}

          {maybe(metadata?.vyperVersion, x => (
            <ActionInfo label={t`Vyper Version`} value={x} />
          ))}

          {maybe(metadata?.registry, x => (
            <AddressActionInfo network={network} title={t`Registry`} address={x} />
          ))}
          <ActionInfo label={t`ID`} value={poolId} loading={!poolId} />
        </Stack>
      </CardContent>
    </Card>
  )
}
