import type { TransferProps } from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import networks from '@/networks'

import { Chip } from '@/ui/Typography'
import { Item, Items } from '@/ui/Items'
import { StyledInformationSquare16 } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import Box from '@/ui/Box'
import PoolParametersDaoFees from '@/components/PagePool/PoolDetails/PoolStats/PoolParametersDaoFees'
import PoolTotalStaked from '@/components/PagePool/PoolDetails/PoolStats/PoolTotalStaked'
import Stats from '@/ui/Stats'
import Contracts from '@/components/PagePool/PoolDetails/PoolStats/Contracts'
import PoolParametersA from '@/components/PagePool/PoolDetails/PoolStats/PoolParametersA'
import { useLiquidity, useVolume } from '@/entities/pool/lib/pool-info'
import { BigDecimal } from '@/shared/curve-lib'

const PoolParameters: React.FC<
  {
    parameters: PoolParameters
  } & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>
> = ({ parameters, poolData, poolDataCacheOrApi, routerParams }) => {
  const { rChainId, rPoolId } = routerParams
  const pricesApi = networks[rChainId].pricesApi
  const { data: tvl } = useLiquidity({ chainId: rChainId, poolId: rPoolId })
  const { data: volume } = useVolume({ chainId: rChainId, poolId: rPoolId })

  const haveWrappedCoins = useMemo(() => {
    if (!!poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  const liquidityUtilization = useMemo(() => {
    if (tvl?.value && volume?.value) {
      if (tvl.value.isZero() || volume.value.isZero()) {
        return formatNumber(0, { style: 'percent', maximumFractionDigits: 0 })
      } else {
        return volume.value.div(tvl.value).times(new BigDecimal(100)).toString()
      }
    } else {
      return '-'
    }
  }, [tvl, volume])

  const { gamma, adminFee, fee } = parameters ?? {}

  const dailyUsdStr = volume?.value?.toString() ?? '-'
  return (
    <>
      <article>
        <Items listItemMargin="var(--spacing-1)">
          <Item>
            {t`Daily USD volume:`}{' '}
            <strong title={dailyUsdStr}>{dailyUsdStr}</strong>
          </Item>
          <Item>
            {t`Liquidity utilization:`}{' '}
            <Chip
              isBold={liquidityUtilization !== '-'}
              size="md"
              tooltip={t`24h Volume/Liquidity ratio`}
              tooltipProps={{
                placement: 'bottom end',
              }}
            >
              {liquidityUtilization}
              <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
            </Chip>
          </Item>
        </Items>
      </article>

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
              tooltipProps={{
                placement: 'bottom end',
              }}
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
