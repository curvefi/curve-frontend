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

type Props = {
  gaugeData: GaugeFormattedData
}

const GaugeListItem = ({ gaugeData }: Props) => {
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
      <MainRow>
        <TitleComp gaugeData={gaugeData} imageBaseUrl={imageBaseUrl} />
        <DataComp>
          <BoxColumn>
            <DataTitle>{t`Weight`}</DataTitle>
            <GaugeData>{gaugeData.gauge_relative_weight.toFixed(2)}%</GaugeData>
          </BoxColumn>
          <BoxColumn>
            <DataTitle>{t`7d Delta`}</DataTitle>
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
            <DataTitle>{t`60d Delta`}</DataTitle>
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
      </MainRow>
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
          <GaugeDetailsContainer>
            {gaugeData.pool?.address ? (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Pool`}</DataTitle>
                <GaugeData className="open">
                  <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.pool.address)}>
                    {shortenTokenAddress(gaugeData.pool.address)}
                    <Icon name="Launch" size={16} />
                  </StyledExternalLink>
                </GaugeData>
              </Box>
            ) : (
              ''
            )}
            {gaugeData.pool?.tvl_usd ? (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Pool TVL`}</DataTitle>
                <GaugeInformation className="open">{t`$${formatNumber(gaugeData.pool.tvl_usd, {
                  showDecimalIfSmallNumberOnly: true,
                })}`}</GaugeInformation>
              </Box>
            ) : (
              ''
            )}
            {gaugeData.pool?.trading_volume_24h ? (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`24h Pool Volume`}</DataTitle>
                <GaugeInformation className="open">
                  {t`$${formatNumber(gaugeData.pool.trading_volume_24h, {
                    showDecimalIfSmallNumberOnly: true,
                  })}`}
                </GaugeInformation>
              </Box>
            ) : (
              ''
            )}
            <Box flex flexColumn>
              <DataTitle className="open left-aligned">{t`Gauge`}</DataTitle>
              <GaugeData className="open">
                <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.address)}>
                  {shortenTokenAddress(gaugeData.address)}
                  <Icon name="Launch" size={16} />
                </StyledExternalLink>
              </GaugeData>
            </Box>
            {gaugeData.emissions ? (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Emissions (CRV)`}</DataTitle>
                <GaugeInformation className="open">
                  {formatNumber(gaugeData.emissions, {
                    showDecimalIfSmallNumberOnly: true,
                  })}
                </GaugeInformation>
              </Box>
            ) : (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Emissions (CRV)`}</DataTitle>
                <GaugeInformation className="open">{t`N/A`}</GaugeInformation>
              </Box>
            )}
            <Box flex flexColumn>
              <DataTitle className="open left-aligned">{t`Created`}</DataTitle>
              <GaugeInformation className="open">
                {new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())).toLocaleString()}
              </GaugeInformation>
            </Box>
          </GaugeDetailsContainer>
          <StyledInternalLink
            onClick={(e) => {
              e.preventDefault()
              navigate(`/ethereum/gauges/${gaugeData.address}`)
            }}
          >
            {t`See more Gauge details`}
            <Icon name="ArrowRight" size={16} />
          </StyledInternalLink>
        </OpenContainer>
      )}
    </GaugeBox>
  )
}

const GaugeBox = styled.div`
  display: grid;
  padding: var(--spacing-2);
  gap: var(--spacing-1);
  background-color: var(--summary_content--background-color);
  &:hover {
    cursor: pointer;
  }
`

const MainRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-row-gap: var(--spacing-2);
  padding: 0 var(--spacing-1);
  @media (min-width: 33.125rem) {
    grid-template-columns: 0.5fr 1fr;
    grid-template-rows: 1fr;
  }
`

const DataComp = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  gap: var(--spacing-2);
  justify-content: space-between;
  @media (min-width: 33.125rem) {
    grid-template-columns: 0.7fr 1fr 1fr 0.3fr;
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
`

const BoxColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
  margin-right: auto;
  &:first-child {
    margin-left: var(--spacing-2);
  }
  &:last-child {
    margin-right: var(--spacing-2);
  }
  @media (min-width: 33.125rem) {
    margin: auto 0 auto auto;
  }
`

const DataTitle = styled.h4`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
  text-align: left;
  &.left-aligned {
    text-align: left;
  }
  @media (min-width: 33.125rem) {
    text-align: right;
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

const GaugeInformation = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
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

const GaugeDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--spacing-3);
  border-top: 1px solid var(--gray-500a20);
  padding-top: var(--spacing-3);
  padding-bottom: var(--spacing-3);
  @media (min-width: 28.125rem) {
  }
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
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  padding: var(--spacing-2);
  font-weight: var(--bold);
  text-transform: none;
  text-decoration: none;
  border: 1px solid var(--gray-500a20);
  &:hover {
    cursor: pointer;
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
