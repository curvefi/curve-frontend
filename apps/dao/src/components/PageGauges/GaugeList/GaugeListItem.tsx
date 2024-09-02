import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'
import { formatNumber, shortenTokenAddress } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import { ExternalLink, InternalLink } from '@/ui/Link'
import LineChartComponent from '../../Charts/LineChartComponent'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import TitleComp from './TitleComp'
import CopyIconButton from '@/components/CopyIconButton'
import ExternalLinkIconButton from '@/components/ExternalLinkIconButton'

type Props = {
  gaugeData: GaugeFormattedData
  gridTemplateColumns: string
}

const GaugeListItem = ({ gaugeData, gridTemplateColumns }: Props) => {
  const { gaugeWeightHistoryMapper, getHistoricGaugeWeights } = useStore((state) => state.gauges)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const imageBaseUrl = networks[1].imageBaseUrl

  useEffect(() => {
    if (open && !gaugeWeightHistoryMapper[gaugeData.address]) {
      getHistoricGaugeWeights(gaugeData.address)
    }
  }, [gaugeData.address, gaugeWeightHistoryMapper, getHistoricGaugeWeights, open])

  return (
    <GaugeBox onClick={() => setOpen(!open)}>
      <DataComp gridTemplateColumns={gridTemplateColumns}>
        <TitleComp gaugeData={gaugeData} imageBaseUrl={imageBaseUrl} />
        <BoxColumn>
          <GaugeData>{gaugeData.gauge_relative_weight.toFixed(2)}%</GaugeData>
        </BoxColumn>
        <BoxColumn>
          <GaugeData
            className={`${
              gaugeData.gauge_relative_weight_7d_delta
                ? gaugeData.gauge_relative_weight_7d_delta > 0
                  ? 'green'
                  : 'red'
                : ''
            }`}
          >
            {gaugeData.gauge_relative_weight_7d_delta
              ? `${gaugeData.gauge_relative_weight_7d_delta.toFixed(2)}%`
              : 'N/A'}
          </GaugeData>
        </BoxColumn>
        <BoxColumn>
          <GaugeData
            className={`${
              gaugeData.gauge_relative_weight_60d_delta
                ? gaugeData.gauge_relative_weight_60d_delta > 0
                  ? 'green'
                  : 'red'
                : ''
            }`}
          >
            {gaugeData.gauge_relative_weight_60d_delta
              ? `${gaugeData.gauge_relative_weight_60d_delta.toFixed(2)}%`
              : 'N/A'}
          </GaugeData>
        </BoxColumn>
        <StyledIconButton size="small">
          {open ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
        </StyledIconButton>
      </DataComp>
      {open && (
        <OpenContainer>
          {gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'ERROR' && (
            <ErrorWrapper onClick={(e) => e.stopPropagation()}>
              <ErrorMessage
                message={t`Error fetching historical gauge weights data`}
                onClick={(e?: React.MouseEvent) => {
                  e?.stopPropagation()
                  getHistoricGaugeWeights(gaugeData.address)
                }}
              />
            </ErrorWrapper>
          )}
          {(gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'LOADING' ||
            !gaugeWeightHistoryMapper[gaugeData.address] ||
            (gaugeWeightHistoryMapper[gaugeData.address]?.data.length === 0 &&
              gaugeWeightHistoryMapper[gaugeData.address]?.loadingState !== 'ERROR')) && (
            <StyledSpinnerWrapper>
              <Spinner size={16} />
            </StyledSpinnerWrapper>
          )}
          {gaugeWeightHistoryMapper[gaugeData.address]?.data.length !== 0 &&
            gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'SUCCESS' && (
              <LineChartComponent height={400} data={gaugeWeightHistoryMapper[gaugeData.address]?.data} />
            )}
          <Box flex flexColumn>
            {gaugeData.pool && (
              <>
                <StatsTitleRow>
                  <h6>{t`Pool`}</h6>
                  <h6>{t`24 Volume`}</h6>
                  <h6>{t`TVL`}</h6>
                </StatsTitleRow>
                <StatsRow>
                  {gaugeData.pool?.address && (
                    <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                      <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.pool.address)}>
                        {shortenTokenAddress(gaugeData.pool.address)}
                      </StyledExternalLink>
                      <ExternalLinkIconButton
                        href={networks[1].scanAddressPath(gaugeData.pool.address)}
                        tooltip={t`View on explorer`}
                      />
                      <CopyIconButton tooltip={t`Copy Gauge Address`} copyContent={gaugeData.pool.address} />
                    </Box>
                  )}
                  <h5>
                    {gaugeData.pool?.trading_volume_24h
                      ? formatNumber(gaugeData.pool.trading_volume_24h, {
                          showDecimalIfSmallNumberOnly: true,
                          currency: 'USD',
                        })
                      : 'N/A'}
                  </h5>
                  <h5>
                    {gaugeData.pool?.tvl_usd && gaugeData.pool.tvl_usd !== undefined
                      ? formatNumber(gaugeData.pool.tvl_usd, {
                          showDecimalIfSmallNumberOnly: true,
                          currency: 'USD',
                        })
                      : 'N/A'}
                  </h5>
                </StatsRow>
              </>
            )}
          </Box>
          <Box flex flexColumn>
            <StatsTitleRow>
              <h6>{t`Gauge`}</h6>
              <h6>{t`Emissions (CRV)`}</h6>
              <h6>{t`Created`}</h6>
            </StatsTitleRow>
            <StatsRow>
              <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.address)}>
                  {shortenTokenAddress(gaugeData.address)}
                </StyledExternalLink>
                <ExternalLinkIconButton
                  href={networks[1].scanAddressPath(gaugeData.address)}
                  tooltip={t`View on explorer`}
                />
                <CopyIconButton tooltip={t`Copy Gauge Address`} copyContent={gaugeData.address} />
              </Box>
              <h5>
                {gaugeData.emissions
                  ? formatNumber(gaugeData.emissions, {
                      showDecimalIfSmallNumberOnly: true,
                    })
                  : 'N/A'}
              </h5>
              <h5>
                {new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())).toLocaleString()}
              </h5>
            </StatsRow>
          </Box>
          <Box flex flexGap={'var(--spacing-3)'} flexAlignItems={'center'} margin={'auto auto auto 0'}>
            <StyledInternalLink
              onClick={(e) => {
                e.preventDefault()
                navigate(`/ethereum/gauges/${gaugeData.address}`)
              }}
            >
              {t`VIEW GAUGE`}
              <Icon name="ArrowRight" size={16} />
            </StyledInternalLink>
          </Box>
        </OpenContainer>
      )}
    </GaugeBox>
  )
}

const GaugeBox = styled.div`
  display: grid;
  padding: var(--spacing-2) 0 calc(var(--spacing-2) + var(--spacing-1));
  gap: var(--spacing-1);
  border-bottom: 1px solid var(--gray-500a20);
  &:hover {
    cursor: pointer;
  }
  &:last-child {
    border-bottom: none;
  }
`

const DataComp = styled.div<{ gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
`

const BoxColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-2);
  margin: auto 0 auto auto;
  &:first-child {
    margin-left: var(--spacing-2);
  }
  &:last-child {
    margin-right: var(--spacing-2);
  }
`

const GaugeData = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-align: right;
  &.green {
    color: var(--chart-green);
  }
  &.red {
    color: var(--chart-red);
  }
  &.open {
    font-size: var(--font-size-2);
  }
`

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
  margin-right: 0;
`

const OpenContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3) var(--spacing-1) 0;
  gap: var(--spacing-2);
`

const StatsTitleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid var(--gray-500a20);
  padding: var(--spacing-1) var(--spacing-2);
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-2);
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: end;
  gap: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-transform: none;
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

const StyledInternalLink = styled(InternalLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-weight: var(--bold);
  text-transform: none;
  text-decoration: none;
  border: 1px solid var(--link--color);
  margin-left: auto;
  &:hover {
    cursor: pointer;
    color: var(--button_outlined--hover--color);
    border-color: var(--button_outlined--hover--color);
    background-color: var(--button_outlined--hover--background-color);
  }
`

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  height: 400px;
`

export default GaugeListItem
