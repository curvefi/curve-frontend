import { useMemo } from 'react'
import { styled } from 'styled-components'
import { Contracts } from '@/dex/components/PagePool/PoolDetails/PoolStats/Contracts'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query.ts'
import { useStore } from '@/dex/store/useStore'
import Stack from '@mui/material/Stack'
import { FORMAT_OPTIONS, formatDate, formatNumber } from '@ui/utils'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { weiToEther } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const PoolParameters = ({
  poolData,
  poolDataCacheOrApi,
  routerParams,
}: Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>) => {
  const { rChainId, rPoolIdOrAddress } = routerParams
  const {
    data: { pricesApi, isLite },
  } = useNetworkByChain({ chainId: rChainId })
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[poolId ?? ''])
  const volume = useStore((state) => state.pools.volumeMapper[rChainId]?.[poolId ?? ''])

  const haveWrappedCoins = useMemo(() => {
    if (poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  const liquidityUtilization = useMemo(
    () =>
      tvl?.value && volume?.value
        ? +tvl.value && +volume.value
          ? formatNumber((+volume.value / +tvl.value) * 100, FORMAT_OPTIONS.PERCENT)
          : formatNumber(0, { style: 'percent', maximumFractionDigits: 0 })
        : '-',
    [tvl, volume],
  )

  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  const { data: parameters } = usePoolParameters({ chainId: rChainId, poolId })

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
    priceScale,
    priceOracle,
  } = parameters ?? {}

  const isEymaPools = rChainId === 250 && poolDataCacheOrApi.pool.id.startsWith('factory-eywa')

  return (
    <Stack gap={Spacing.lg}>
      <Stack gap={Spacing.sm}>
        {!isLite && (
          <>
            <ActionInfo
              label={t`Daily USD volume`}
              value={formatNumber(volume?.value, { notation: 'compact', defaultValue: '-' })}
            />
            <ActionInfo
              label={t`Liquidity utilization`}
              value={liquidityUtilization}
              valueTooltip={t`24h Volume/Liquidity ratio`}
            />
          </>
        )}

        <ActionInfo
          label={t`Total LP Tokens staked:`}
          value={
            staked?.gaugeTotalSupply === 'string'
              ? staked.gaugeTotalSupply
              : formatNumber(staked?.gaugeTotalSupply && weiToEther(+staked.gaugeTotalSupply), {
                  notation: 'compact',
                  defaultValue: '-',
                })
          }
        />
        <ActionInfo
          label={t`Staked percent`}
          value={
            typeof staked?.totalStakedPercent === 'string'
              ? staked.totalStakedPercent
              : formatNumber(staked?.totalStakedPercent, { style: 'percent', defaultValue: '-' })
          }
        />

        <ActionInfo label={t`Fee`} value={formatNumber(fee, { style: 'percent', maximumFractionDigits: 4 })} />

        <ActionInfo
          label={t`DAO fee`}
          valueTooltip={t`The total fee on each trade is split in two parts: one part goes to the pool’s Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
          value={formatNumber(isEymaPools ? +adminFee / 2 : adminFee, {
            style: 'percent',
            maximumFractionDigits: 4,
          })}
        />
        {isEymaPools && <ActionInfo label={`EYWA fee`} value={+adminFee / 2} />}

        <ActionInfo
          label={t`Virtual price`}
          value={formatNumber(parameters?.virtualPrice, { maximumFractionDigits: 8, defaultValue: '-' })}
          valueTooltip={t`Measures pool growth; this is not a dollar value`}
        />
      </Stack>

      {/* price oracle & price scale */}
      {poolData && haveWrappedCoins && (priceOracle || priceScale) && !pricesApi && (
        <Stack spacing={Spacing.sm}>
          <Title>Price Data</Title>
          {priceOracle && (
            <ActionInfo
              label={t`Price Oracle`}
              value={priceOracle.map((p, idx) => (
                <strong key={p}>
                  {poolData.pool.wrappedCoins[idx + 1]}: {formatNumber(p, { maximumFractionDigits: 10 })}
                </strong>
              ))}
            />
          )}
          {priceScale && (
            <ActionInfo
              label={t`Price Scale`}
              value={priceScale.map((p, idx) => (
                <strong key={p}>
                  {poolData.pool.wrappedCoins[idx + 1]}: {formatNumber(p, { maximumFractionDigits: 10 })}
                </strong>
              ))}
            />
          )}
        </Stack>
      )}

      {!pricesApi && (
        <Stack spacing={Spacing.sm}>
          <Title>{t`Pool Parameters`}</Title>
          {gamma && <ActionInfo label={t`Gamma`} value={formatNumber(gamma, { useGrouping: false })} />}
          {virtualPrice && (
            <ActionInfo
              label={t`A`}
              value={formatNumber(A, { useGrouping: false })}
              valueTooltip={
                <Stack gap={Spacing.sm}>
                  {t`Amplification coefficient chosen from fluctuation of prices around 1.`}
                  {initial_A_time != null &&
                    future_A_time != null &&
                    dayjs().isAfter(future_A_time, 'day') &&
                    t`Last change occurred between ${formatDate(initial_A_time, 'short')} and ${formatDate(
                      future_A_time,
                      'short',
                    )}, when A ramped from ${initial_A} to ${future_A}.`}
                </Stack>
              }
            />
          )}
          {initial_A_time != null && future_A_time != null && !dayjs().isAfter(future_A_time, 'day') && (
            <>
              <ActionInfo
                label={t`Ramping A`}
                valueTooltip={t`Slowly changing up A so that it doesn't negatively change virtual price growth of shares`}
                prevValue={formatNumber(initial_A, { useGrouping: false })}
                value={formatNumber(future_A, { useGrouping: false })}
              />
              <ActionInfo
                label=" "
                value={`${formatDate(initial_A_time, 'short')} to ${formatDate(future_A_time, 'short')}`}
              />
            </>
          )}
        </Stack>
      )}
      <Contracts rChainId={rChainId} poolDataCacheOrApi={poolDataCacheOrApi} />
    </Stack>
  )
}

const Title = styled.h3`
  margin-bottom: var(--spacing-1);
`
