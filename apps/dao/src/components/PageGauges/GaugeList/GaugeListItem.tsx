import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'

import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'
import { formatNumber, shortenTokenAddress, formatNumberWithSuffix } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import LineChartComponent from '../components/LineChartComponent'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'

type Props = {
  gaugeData: GaugeFormattedData
}

const GaugeListItem = ({ gaugeData }: Props) => {
  const { gaugeWeightHistoryMapper, getHistoricGaugeWeights } = useStore((state) => state.gauges)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !gaugeWeightHistoryMapper[gaugeData.address]) {
      getHistoricGaugeWeights(gaugeData.address)
    }
  }, [gaugeData.address, gaugeWeightHistoryMapper, getHistoricGaugeWeights, open])

  return (
    <GaugeBox onClick={() => setOpen(!open)}>
      <MainRow>
        <TitleComp>
          <BoxedDataComp>
            {gaugeData.platform && <BoxedData>{gaugeData.platform}</BoxedData>}
            {gaugeData.pool?.chain && <BoxedData>{gaugeData.pool.chain}</BoxedData>}
            {gaugeData.market?.chain && <BoxedData>{gaugeData.market.chain}</BoxedData>}
          </BoxedDataComp>
          <Title>{gaugeData.title}</Title>
        </TitleComp>
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
                <GaugeInformation className="open">{t`$${formatNumber(gaugeData.pool.tvl_usd)}`}</GaugeInformation>
              </Box>
            ) : (
              ''
            )}
            {gaugeData.pool?.trading_volume_24h ? (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Pool Volume 24h`}</DataTitle>
                <GaugeInformation className="open">
                  {t`$${formatNumber(gaugeData.pool.trading_volume_24h)}`}
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
                <GaugeInformation className="open">{formatNumber(gaugeData.emissions)}</GaugeInformation>
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

const TitleComp = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 1fr;
  justify-content: space-between;
  grid-row: 1 / 2;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--gray-500a20);
  padding-bottom: var(--spacing-2);
  @media (min-width: 33.125rem) {
    display: flex;
    flex-direction: column;
    border-bottom: none;
  }
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-1);
  grid-row: 1 / 2;
  margin-left: auto;
  margin-right: var(--spacing-2);
  @media (min-width: 33.125rem) {
    display: flex;
    flex-direction: row;
    margin-left: 0;
  }
`

const Title = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  margin: auto 0 0;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  margin-left: var(--spacing-2);
  @media (min-width: 33.125rem) {
    margin: auto 0 0 0.25rem;
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

const BoxedData = styled.p`
  border: 1px solid var(--gray-500);
  padding: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
  margin: auto 0 0;
  @media (min-width: 33.125rem) {
    margin: 0;
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
`

const GaugeDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--spacing-3);
  border-top: 1px solid var(--gray-500a20);
  padding-top: var(--spacing-3);
  padding-bottom: var(--spacing-2);
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
