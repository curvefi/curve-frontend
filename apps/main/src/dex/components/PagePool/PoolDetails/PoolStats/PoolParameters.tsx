import { useMemo } from 'react'
import { styled } from 'styled-components'
import { Contracts } from '@/dex/components/PagePool/PoolDetails/PoolStats/Contracts'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTotalStaked } from '@/dex/hooks/usePoolTotalStaked'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '@ui/utils'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain, weiToEther, formatNumber, amount } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const PoolParameters = ({
  poolData,
  poolDataCacheOrApi,
  routerParams,
}: Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>) => {
  const { rChainId: chainId, rPoolIdOrAddress } = routerParams
  const {
    data: { pricesApi, isLite },
  } = useNetworkByChain({ chainId })
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress: rPoolIdOrAddress })

  const { data: tvl } = usePoolTvl({ chainId, poolId })
  const { data: volume } = usePoolVolume({ chainId, poolId })

  const haveWrappedCoins = useMemo(() => {
    if (poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  const liquidityUtilization = useMemo(
    () =>
      tvl && volume
        ? +tvl && +volume
          ? formatNumber(amount((+volume / +tvl) * 100), 'percent.value')
          : formatNumber(0, { maximumFractionDigits: 0, unit: 'percentage', abbreviate: false })
        : '-',
    [tvl, volume],
  )

  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  const { data: parameters, isLoading: isLoadingParameters } = usePoolParameters({ chainId, poolId })

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- Existing violation before enabling this rule.
  const isEymaPools = chainId === Chain.Fantom && poolDataCacheOrApi.pool.id.startsWith('factory-eywa')

  return (
    <Stack sx={{ gap: Spacing.lg }}>
      <Stack sx={{ gap: Spacing.sm }}>
        {!isLite && (
          <>
            <ActionInfo
              label={t`Daily USD volume`}
              value={formatNumber(amount(volume), { abbreviate: true, fallback: '-' })}
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
              : formatNumber(amount(staked?.gaugeTotalSupply && weiToEther(+staked.gaugeTotalSupply)), {
                  abbreviate: true,
                  fallback: '-',
                })
          }
        />
        <ActionInfo
          label={t`Staked percent`}
          value={
            typeof staked?.totalStakedPercent === 'string'
              ? staked.totalStakedPercent
              : formatNumber(staked?.totalStakedPercent, 'percent.value')
          }
        />

        <ActionInfo
          label={t`Fee`}
          loading={isLoadingParameters}
          value={formatNumber(amount(fee), {
            maximumFractionDigits: 4,
            unit: 'percentage',
            abbreviate: false,
            fallback: '-',
          })}
        />

        <ActionInfo
          label={t`DAO fee`}
          loading={isLoadingParameters}
          valueTooltip={t`The total fee on each trade is split in two parts: one part goes to the pool’s Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
          value={formatNumber(amount(isEymaPools ? +adminFee / 2 : adminFee), {
            maximumFractionDigits: 4,
            unit: 'percentage',
            abbreviate: false,
            fallback: '-',
          })}
        />
        {isEymaPools && <ActionInfo label={`EYWA fee`} loading={isLoadingParameters} value={+adminFee / 2} />}

        <ActionInfo
          label={t`Virtual price`}
          loading={isLoadingParameters}
          value={formatNumber(amount(parameters?.virtualPrice), {
            maximumFractionDigits: 8,
            abbreviate: false,
            fallback: '-',
          })}
          valueTooltip={t`Measures pool growth; this is not a dollar value`}
        />
      </Stack>
      {/* price oracle & price scale */}
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule. */}
      {poolData && haveWrappedCoins && (priceOracle || priceScale) && !pricesApi && (
        <Stack spacing={Spacing.sm}>
          <Title>Price Data</Title>
          {priceOracle && (
            <ActionInfo
              label={t`Price Oracle`}
              value={priceOracle.map((p, idx) => (
                <strong key={p}>
                  {poolData.pool.wrappedCoins[idx + 1]}:{' '}
                  {formatNumber(amount(p), { maximumFractionDigits: 10, abbreviate: false, fallback: '-' })}
                </strong>
              ))}
            />
          )}
          {priceScale && (
            <ActionInfo
              label={t`Price Scale`}
              value={priceScale.map((p, idx) => (
                <strong key={p}>
                  {poolData.pool.wrappedCoins[idx + 1]}:{' '}
                  {formatNumber(amount(p), { maximumFractionDigits: 10, abbreviate: false, fallback: '-' })}
                </strong>
              ))}
            />
          )}
        </Stack>
      )}
      {!pricesApi && (
        <Stack spacing={Spacing.sm}>
          <Title>{t`Pool Parameters`}</Title>
          {gamma && (
            <ActionInfo
              label={t`Gamma`}
              value={formatNumber(amount(gamma), { useGrouping: false, abbreviate: false, fallback: '-' })}
            />
          )}
          {virtualPrice && (
            <ActionInfo
              label={t`A`}
              value={formatNumber(amount(A), { useGrouping: false, abbreviate: false, fallback: '-' })}
              valueTooltip={
                <Stack sx={{ gap: Spacing.sm }}>
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
                prevValue={formatNumber(amount(initial_A), { useGrouping: false, abbreviate: false, fallback: '-' })}
                value={formatNumber(amount(future_A), { useGrouping: false, abbreviate: false, fallback: '-' })}
              />
              <ActionInfo
                label=" "
                value={`${formatDate(initial_A_time, 'short')} to ${formatDate(future_A_time, 'short')}`}
              />
            </>
          )}
        </Stack>
      )}
      <Contracts rChainId={chainId} poolDataCacheOrApi={poolDataCacheOrApi} />
      {/** Copied from market page, temporary as this page will get a redesign */}
      <Stack sx={{ gap: Spacing.xs }}>
        <Typography variant="headingXsBold">{t`Pool`}</Typography>
        <Stack>
          <ActionInfo label={t`ID`} value={poolId} loading={!poolId} />
        </Stack>
      </Stack>
    </Stack>
  )
}

const Title = styled.h3`
  margin-bottom: var(--spacing-1);
`
