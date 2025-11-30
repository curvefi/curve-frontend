import { useMemo } from 'react'
import { styled } from 'styled-components'
import Contracts from '@/dex/components/PagePool/PoolDetails/PoolStats/Contracts'
import PoolParametersA from '@/dex/components/PagePool/PoolDetails/PoolStats/PoolParametersA'
import PoolParametersDaoFees from '@/dex/components/PagePool/PoolDetails/PoolStats/PoolParametersDaoFees'
import PoolTotalStaked from '@/dex/components/PagePool/PoolDetails/PoolStats/PoolTotalStaked'
import { StyledInformationSquare16 } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import usePoolTotalStaked from '@/dex/hooks/usePoolTotalStaked'
import { usePoolVolume } from '@/dex/queries/pool-volume'
import useStore from '@/dex/store/useStore'
import type { PoolParameters } from '@/dex/types/main.types'
import { formatDisplayDate } from '@/dex/utils/utilsDates'
import Stack from '@mui/material/Stack'
import Box from '@ui/Box'
import { Item, Items } from '@ui/Items'
import Stats from '@ui/Stats'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useActionInfo } from '@ui-kit/hooks/useFeatureFlags'
import dayjs from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { weiToEther } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const PoolParameters = ({
  parameters,
  poolData,
  poolDataCacheOrApi,
  routerParams,
}: {
  parameters: PoolParameters
} & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>) => {
  const { rChainId, rPoolId } = routerParams
  const {
    data: { pricesApi, isLite },
  } = useNetworkByChain({ chainId: rChainId })
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[rPoolId])
  const { data: volume } = usePoolVolume({ chainId: rChainId, poolId: rPoolId })

  const haveWrappedCoins = useMemo(() => {
    if (poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  const liquidityUtilization = useMemo(
    () =>
      tvl?.value && volume
        ? +tvl.value && +volume
          ? formatNumber((+volume / +tvl.value) * 100, FORMAT_OPTIONS.PERCENT)
          : formatNumber(0, { style: 'percent', maximumFractionDigits: 0 })
        : '-',
    [tvl, volume],
  )

  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  const { A, initial_A, initial_A_time, future_A, future_A_time, virtualPrice } = parameters ?? {}

  const { gamma, adminFee, fee } = parameters ?? {}
  if (useActionInfo()) {
    const isEymaPools = rChainId === 250 && poolDataCacheOrApi.pool.id.startsWith('factory-eywa')
    return (
      <Stack gap={Spacing.lg}>
        <Stack gap={Spacing.sm}>
          {!isLite && (
            <>
              <ActionInfo
                label={t`Daily USD volume`}
                value={formatNumber(volume, { notation: 'compact', defaultValue: '-' })}
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

          {adminFee != null && (
            <>
              <ActionInfo
                label={t`DAO fee`}
                valueTooltip={t`The total fee on each trade is split in two parts: one part goes to the pool’s Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
                value={formatNumber(isEymaPools ? +adminFee / 2 : adminFee, {
                  style: 'percent',
                  maximumFractionDigits: 4,
                })}
              />
              {isEymaPools && <ActionInfo label={`EYWA fee`} value={+adminFee / 2} />}
            </>
          )}

          <ActionInfo
            label={t`Virtual price`}
            value={formatNumber(parameters?.virtualPrice, { maximumFractionDigits: 8, defaultValue: '-' })}
            valueTooltip={t`Measures pool growth; this is not a dollar value`}
          />
        </Stack>

        {/* price oracle & price scale */}
        {poolData && haveWrappedCoins && (parameters.priceOracle || parameters.priceScale) && !pricesApi && (
          <Stack spacing={Spacing.sm}>
            <Title>Price Data</Title>
            {parameters.priceOracle && (
              <ActionInfo
                label={t`Price Oracle`}
                value={parameters.priceOracle.map((p, idx) => (
                  <strong key={p}>
                    {poolData.pool.wrappedCoins[idx + 1]}: {formatNumber(p, { maximumFractionDigits: 10 })}
                  </strong>
                ))}
              />
            )}
            {parameters.priceScale && (
              <ActionInfo
                label={t`Price Scale`}
                value={parameters.priceScale.map((p, idx) => (
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
                    {future_A_time != null &&
                      dayjs().isAfter(future_A_time, 'day') &&
                      t`Last change occurred between ${formatDisplayDate(dayjs(initial_A_time))} and ${formatDisplayDate(
                        dayjs(future_A_time),
                      )}, when A ramped from ${initial_A} to ${future_A}.`}
                  </Stack>
                }
              />
            )}
            {future_A_time != null && !dayjs().isAfter(future_A_time, 'day') && (
              <>
                <ActionInfo
                  label={t`Ramping A`}
                  valueTooltip={t`Slowly changing up A so that it doesn't negatively change virtual price growth of shares`}
                  prevValue={formatNumber(initial_A, { useGrouping: false })}
                  value={formatNumber(future_A, { useGrouping: false })}
                />
                <ActionInfo
                  label=" "
                  value={`${formatDisplayDate(dayjs(initial_A_time))} to ${formatDisplayDate(dayjs(future_A_time))}`}
                />
              </>
            )}
          </Stack>
        )}
        <Contracts rChainId={rChainId} poolDataCacheOrApi={poolDataCacheOrApi} />
      </Stack>
    )
  }
  return (
    <>
      {!isLite && (
        <article>
          <Items listItemMargin="var(--spacing-1)">
            <Item>
              {t`Daily USD volume:`}{' '}
              <strong title={volume ?? '-'}>{formatNumber(volume, { notation: 'compact', defaultValue: '-' })}</strong>
            </Item>
            <Item>
              {t`Liquidity utilization:`}{' '}
              <Chip
                isBold={liquidityUtilization !== '-'}
                size="md"
                tooltip={t`24h Volume/Liquidity ratio`}
                tooltipProps={{ placement: 'bottom-end' }}
              >
                {liquidityUtilization}
                <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
              </Chip>
            </Item>
          </Items>
        </article>
      )}

      <PoolTotalStaked poolDataCacheOrApi={poolDataCacheOrApi} />

      <article>
        <Items listItemMargin="var(--spacing-1)">
          <Item>
            {t`Fee:`} <strong>{formatNumber(fee, { style: 'percent', maximumFractionDigits: 4 })}</strong>
          </Item>
          <PoolParametersDaoFees
            adminFee={adminFee}
            isEymaPools={rChainId === 250 && poolDataCacheOrApi.pool.id.startsWith('factory-eywa')}
          />
        </Items>
      </article>

      <article>
        <Items listItemMargin="var(--spacing-1)">
          <Item>
            {t`Virtual price:`}{' '}
            <Chip
              isBold={parameters?.virtualPrice !== ''}
              size="md"
              tooltip={t`Measures pool growth; this is not a dollar value`}
              tooltipProps={{ placement: 'bottom-end' }}
            >
              {formatNumber(parameters?.virtualPrice, { maximumFractionDigits: 8, defaultValue: '-' })}
              <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
            </Chip>
          </Item>
        </Items>
      </article>

      {/* price oracle & price scale */}
      {!!poolData && haveWrappedCoins && Array.isArray(parameters.priceOracle) && !pricesApi && (
        <article>
          <Title>Price Data</Title>
          <Box grid>
            {Array.isArray(parameters.priceOracle) && (
              <Stats label={t`Price Oracle:`}>
                {parameters.priceOracle.map((p, idx) => {
                  const wrappedCoins = poolData.pool.wrappedCoins as string[]
                  const symbol = wrappedCoins[idx + 1]
                  return (
                    <strong key={p}>
                      {symbol}: {formatNumber(p, { maximumFractionDigits: 10 })}
                    </strong>
                  )
                })}
              </Stats>
            )}
          </Box>
        </article>
      )}

      {!!poolData && haveWrappedCoins && Array.isArray(parameters.priceScale) && !pricesApi && (
        <article>
          <Stats label={t`Price Scale:`}>
            {parameters.priceScale.map((p, idx) => {
              const wrappedCoins = poolData.pool.wrappedCoins as string[]
              const symbol = wrappedCoins[idx + 1]
              return (
                <strong key={p}>
                  {symbol}: {formatNumber(p, { maximumFractionDigits: 10 })}
                </strong>
              )
            })}
          </Stats>
        </article>
      )}

      {!pricesApi && (
        <article>
          <Title>{t`Pool Parameters`}</Title>
          <Items listItemMargin="var(--spacing-1)">
            {gamma && (
              <Item>
                Gamma: <strong>{formatNumber(gamma, { useGrouping: false })}</strong>
              </Item>
            )}

            <PoolParametersA parameters={parameters} />
          </Items>
        </article>
      )}
      <article>
        <Contracts rChainId={rChainId} poolDataCacheOrApi={poolDataCacheOrApi} />
      </article>
    </>
  )
}

const Title = styled.h3`
  margin-bottom: var(--spacing-1);
`

export default PoolParameters
