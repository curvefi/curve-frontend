import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber, convertToLocaleTimestamp, formatDateFromTimestamp, shortenTokenAddress } from '@/ui/utils/'
import networks from '@/networks'
import useStore from '@/store/useStore'

import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import Box from '@/ui/Box'
import CopyIconButton from '@/components/CopyIconButton'
import ExternalLinkIconButton from '@/components/ExternalLinkIconButton'

interface GaugeMetricsProps {
  gaugeData: GaugeFormattedData | undefined
  dataLoading: boolean
}

const GaugeMetrics = ({ gaugeData, dataLoading }: GaugeMetricsProps) => {
  const gaugeCurveApiData = useStore(
    (state) => state.gauges.gaugeCurveApiData.data[gaugeData?.address.toLowerCase() || ''],
  )
  const gaugeExternalLink = gaugeCurveApiData?.isPool
    ? gaugeCurveApiData.poolUrls.deposit[0]
    : gaugeCurveApiData?.lendingVaultUrls.deposit

  return (
    <Wrapper>
      <h4>{t`GAUGE METRICS`}</h4>
      <GaugeMetricsWrapper>
        <Box flex flexAlignItems="center">
          <MetricsComp
            loading={dataLoading}
            title={t`Gauge`}
            data={
              <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                <StyledMetricsColumnData>{shortenTokenAddress(gaugeData?.address || '')}</StyledMetricsColumnData>
                <BigScreenButtonsWrapper>
                  <ExternalLinkIconButton
                    href={networks[1].scanAddressPath(gaugeData?.address || '')}
                    tooltip={t`View on explorer`}
                  />
                  <CopyIconButton copyContent={gaugeData?.address || ''} tooltip={t`Copy address`} />
                </BigScreenButtonsWrapper>
              </Box>
            }
          />
          <SmallScreenButtonsWrapper>
            <ExternalLinkIconButton
              href={networks[1].scanAddressPath(gaugeData?.address || '')}
              tooltip={t`View on explorer`}
            />
            <CopyIconButton copyContent={gaugeData?.address || ''} tooltip={t`Copy address`} />
          </SmallScreenButtonsWrapper>
        </Box>
        <MetricsComp
          loading={dataLoading}
          title={t`Created`}
          data={
            <StyledMetricsColumnData>
              {formatDateFromTimestamp(
                convertToLocaleTimestamp(new Date(gaugeData?.creation_date || '').getTime() / 1000),
              )}
            </StyledMetricsColumnData>
          }
        />
        {gaugeData?.emissions ? (
          <MetricsComp
            loading={dataLoading}
            title={t`Emissions (CRV)`}
            data={
              <StyledMetricsColumnData>
                {formatNumber(gaugeData.emissions, { notation: 'compact' })}
              </StyledMetricsColumnData>
            }
          />
        ) : (
          <MetricsComp
            loading={dataLoading}
            title={t`Emissions (CRV)`}
            data={<StyledMetricsColumnData>{t`N/A`}</StyledMetricsColumnData>}
          />
        )}
        <MetricsComp
          loading={dataLoading}
          title={t`Relative Weight`}
          data={
            <StyledMetricsColumnData>
              {gaugeData?.gauge_relative_weight
                ? `${formatNumber(gaugeData?.gauge_relative_weight, { notation: 'compact' })}%`
                : 'N/A'}
            </StyledMetricsColumnData>
          }
        />
        <MetricsComp
          loading={dataLoading}
          title={t`7d Delta`}
          data={
            <StyledMetricsColumnData
              className={`${
                gaugeData?.gauge_relative_weight_7d_delta
                  ? gaugeData?.gauge_relative_weight_7d_delta > 0
                    ? 'green'
                    : 'red'
                  : ''
              }`}
            >
              {gaugeData?.gauge_relative_weight_7d_delta
                ? `${formatNumber(gaugeData?.gauge_relative_weight_7d_delta, { notation: 'compact' })}%`
                : 'N/A'}
            </StyledMetricsColumnData>
          }
        />
        <MetricsComp
          loading={dataLoading}
          title={t`60d Delta`}
          data={
            <StyledMetricsColumnData
              className={`${
                gaugeData?.gauge_relative_weight_60d_delta
                  ? gaugeData?.gauge_relative_weight_60d_delta > 0
                    ? 'green'
                    : 'red'
                  : ''
              }`}
            >
              {gaugeData?.gauge_relative_weight_60d_delta
                ? `${formatNumber(gaugeData?.gauge_relative_weight_60d_delta, { notation: 'compact' })}%`
                : 'N/A'}
            </StyledMetricsColumnData>
          }
        />
      </GaugeMetricsWrapper>
      <PoolMetricsWrapper>
        {gaugeData?.pool?.address && (
          <Box flex flexAlignItems="center">
            <MetricsComp
              loading={dataLoading}
              title={t`Pool`}
              data={
                <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                  <StyledMetricsColumnData>{shortenTokenAddress(gaugeData?.pool?.address)}</StyledMetricsColumnData>
                  <BigScreenButtonsWrapper>
                    <ExternalLinkIconButton
                      href={gaugeExternalLink}
                      tooltip={gaugeCurveApiData?.isPool ? t`Visit pool` : t`Visit market`}
                    />
                    <CopyIconButton copyContent={gaugeData?.pool?.address} tooltip={t`Copy address`} />
                  </BigScreenButtonsWrapper>
                </Box>
              }
            />
            <SmallScreenButtonsWrapper>
              <ExternalLinkIconButton
                href={networks[1].scanAddressPath(gaugeData?.pool?.address)}
                tooltip={t`View on explorer`}
              />
              <CopyIconButton copyContent={gaugeData?.pool?.address} tooltip={t`Copy address`} />
            </SmallScreenButtonsWrapper>
          </Box>
        )}
        {gaugeData?.pool?.tvl_usd ? (
          <MetricsComp
            loading={dataLoading}
            title={t`Pool TVL`}
            data={
              <StyledMetricsColumnData>{t`${formatNumber(gaugeData?.pool?.tvl_usd, {
                currency: 'USD',
                notation: 'compact',
              })}`}</StyledMetricsColumnData>
            }
          />
        ) : (
          ''
        )}
        {gaugeData?.pool?.trading_volume_24h ? (
          <MetricsComp
            loading={dataLoading}
            title={t`24h Pool Volume`}
            data={
              <StyledMetricsColumnData>{t`${formatNumber(gaugeData?.pool?.trading_volume_24h, {
                notation: 'compact',
                currency: 'USD',
              })}`}</StyledMetricsColumnData>
            }
          />
        ) : (
          ''
        )}
      </PoolMetricsWrapper>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

const StyledMetricsColumnData = styled(MetricsColumnData)`
  &.green {
    color: var(--chart-green);
  }
  &.red {
    color: var(--chart-red);
  }
  &.open {
    font-size: var(--font-size-3);
  }
`

const GaugeMetricsWrapper = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
  @media (min-width: 31.25rem) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const PoolMetricsWrapper = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
  margin: var(--spacing-3) 0 0;
  @media (min-width: 31.25rem) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const SmallScreenButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  @media (min-width: 26.625rem) {
    display: none;
  }
`

const BigScreenButtonsWrapper = styled.div`
  display: none;
  @media (min-width: 26.625rem) {
    display: flex;
    gap: var(--spacing-1);
  }
`

export default GaugeMetrics
