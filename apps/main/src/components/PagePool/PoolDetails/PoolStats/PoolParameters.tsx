import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import { Item, Items } from '@/ui/Items'
import { StyledInformationSquare16 } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import Box from '@/ui/Box'
import PoolParametersDaoFees from '@/components/PagePool/PoolDetails/PoolStats/PoolParametersDaoFees'
import PoolTotalStaked from '@/components/PagePool/PoolDetails/PoolStats/PoolTotalStaked'
import Stats from '@/ui/Stats'
import Contracts from '@/components/PagePool/PoolDetails/PoolStats/Contracts'
import PoolParametersA from '@/components/PagePool/PoolDetails/PoolStats/PoolParametersA'

type Props = {
  parameters: PoolParameters
}

const PoolParameters: React.FC<Props> = ({ parameters }) => {
  const { rChainId, rPoolId, poolDataCacheOrApi, poolData, pool } = usePoolContext()

  const pricesApi = networks[rChainId].pricesApi
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[rPoolId])
  const volume = useStore((state) => state.pools.volumeMapper[rChainId]?.[rPoolId])

  const haveWrappedCoins = useMemo(() => {
    if (!!poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  const liquidityUtilization = useMemo(() => {
    if (tvl?.value && volume?.value) {
      if (+tvl.value === 0 || +volume.value === 0) {
        return formatNumber(0, { style: 'percent', maximumFractionDigits: 0 })
      } else {
        return formatNumber((Number(volume.value) / Number(tvl.value)) * 100, FORMAT_OPTIONS.PERCENT)
      }
    } else {
      return '-'
    }
  }, [tvl, volume])

  const { gamma, adminFee, fee } = parameters ?? {}

  return (
    <>
      <article>
        <Items listItemMargin="var(--spacing-1)">
          <Item>
            {t`Daily USD volume:`}{' '}
            <strong title={volume?.value ?? '-'}>
              {formatNumber(volume?.value, { notation: 'compact', defaultValue: '-' })}
            </strong>
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

      <PoolTotalStaked pool={pool} />

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
