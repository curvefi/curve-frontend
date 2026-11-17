import { styled } from 'styled-components'
import { getAddress } from 'viem'
import { CopyIconButton } from '@/dao/components/CopyIconButton'
import { ExternalLinkIconButton } from '@/dao/components/ExternalLinkIconButton'
import { MetricsColumnData, MetricsComp } from '@/dao/components/MetricsComp'
import { getGaugeDepositUrl } from '@/dao/queries/gauges.query'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { getChainIdFromGaugeData } from '@/dao/utils'
import { shortenAddress } from '@evm-ui/utils'
import { Box } from '@legacy-ui/Box'
import { scanAddressPath } from '@legacy-ui/utils/'
import { formatDate } from '@primitives/date.utils'
import { Chain } from '@primitives/network.utils'
import { formatNumber } from '@primitives/number.utils'
import { t } from '@ui/lib/i18n'

type GaugeMetricsProps = { gaugeData: GaugeFormattedData | undefined; dataLoading: boolean }

export const GaugeMetrics = ({ gaugeData, dataLoading }: GaugeMetricsProps) => {
  const gaugeAddress = gaugeData?.effectiveAddress?.toLowerCase() ?? gaugeData?.address?.toLowerCase() ?? ''
  const chainId = getChainIdFromGaugeData(gaugeData)
  const isSideChain = chainId !== Chain.Ethereum
  const emissions = isSideChain ? gaugeData?.prevEpochEmissions : gaugeData?.emissions
  const gaugeExternalLink = getGaugeDepositUrl(gaugeData)

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
                <StyledMetricsColumnData>{shortenAddress(gaugeAddress)}</StyledMetricsColumnData>
                <BigScreenButtonsWrapper>
                  <ExternalLinkIconButton
                    href={scanAddressPath(Chain.Ethereum, gaugeAddress)}
                    tooltip={t`View on explorer`}
                  />
                  <CopyIconButton copyContent={gaugeAddress} format={getAddress} tooltip={t`Copy address`} />
                </BigScreenButtonsWrapper>
              </Box>
            }
          />
          <SmallScreenButtonsWrapper>
            <ExternalLinkIconButton
              href={scanAddressPath(Chain.Ethereum, gaugeAddress)}
              tooltip={t`View on explorer`}
            />
            <CopyIconButton copyContent={gaugeAddress} format={getAddress} tooltip={t`Copy address`} />
          </SmallScreenButtonsWrapper>
        </Box>
        <MetricsComp
          loading={dataLoading}
          title={t`Created`}
          data={<StyledMetricsColumnData>{gaugeData && formatDate(gaugeData.creationDate)}</StyledMetricsColumnData>}
        />
        {emissions ? (
          <MetricsComp
            loading={dataLoading}
            title={t`Emissions (CRV)`}
            data={<StyledMetricsColumnData>{formatNumber(emissions, 'token.compact')}</StyledMetricsColumnData>}
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
              {gaugeData?.weightRelative ? `${formatNumber(gaugeData.weightRelative, { abbreviate: true })}%` : 'N/A'}
            </StyledMetricsColumnData>
          }
        />
        <MetricsComp
          loading={dataLoading}
          title={t`7d Delta`}
          data={
            <StyledMetricsColumnData
              className={`${
                gaugeData?.weightRelativeDelta7d ? (gaugeData?.weightRelativeDelta7d > 0 ? 'green' : 'red') : ''
              }`}
            >
              {gaugeData?.weightRelativeDelta7d
                ? `${formatNumber(gaugeData.weightRelativeDelta7d, { abbreviate: true })}%`
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
                gaugeData?.weightRelativeDelta60d ? (gaugeData?.weightRelativeDelta60d > 0 ? 'green' : 'red') : ''
              }`}
            >
              {gaugeData?.weightRelativeDelta60d
                ? `${formatNumber(gaugeData.weightRelativeDelta60d, { abbreviate: true })}%`
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
                  <StyledMetricsColumnData>{shortenAddress(gaugeData?.pool?.address)}</StyledMetricsColumnData>
                  <BigScreenButtonsWrapper>
                    <ExternalLinkIconButton href={gaugeExternalLink} tooltip={t`Visit pool`} />
                    <CopyIconButton
                      copyContent={gaugeData?.pool?.address}
                      format={getAddress}
                      tooltip={t`Copy address`}
                    />
                  </BigScreenButtonsWrapper>
                </Box>
              }
            />
            <SmallScreenButtonsWrapper>
              <ExternalLinkIconButton
                href={scanAddressPath(chainId, gaugeData?.pool?.address)}
                tooltip={t`View on explorer`}
              />
              <CopyIconButton copyContent={gaugeData?.pool?.address} format={getAddress} tooltip={t`Copy address`} />
            </SmallScreenButtonsWrapper>
          </Box>
        )}
        {gaugeData?.pool?.tvlUsd ? (
          <MetricsComp
            loading={dataLoading}
            title={t`Pool TVL`}
            data={
              <StyledMetricsColumnData>{t`${formatNumber(gaugeData?.pool?.tvlUsd, 'usd.notional')}`}</StyledMetricsColumnData>
            }
          />
        ) : (
          ''
        )}
        {gaugeData?.pool?.tradingVolume24h ? (
          <MetricsComp
            loading={dataLoading}
            title={t`24h Pool Volume`}
            data={
              <StyledMetricsColumnData>{t`${formatNumber(gaugeData?.pool?.tradingVolume24h, 'usd.notional')}`}</StyledMetricsColumnData>
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
