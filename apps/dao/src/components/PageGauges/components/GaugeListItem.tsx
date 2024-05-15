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
import LineChartComponent from './LineChartComponent'
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
      <Box grid gridTemplateColumns="2fr 0.7fr 0.7fr 0.7fr 0.3fr">
        <Box flex flexColumn flexGap={'var(--spacing-2)'}>
          <Box flex flexGap={'var(--spacing-1)'}>
            {gaugeData.platform && <BoxedData>{gaugeData.platform}</BoxedData>}
            {gaugeData.pool?.chain && <BoxedData>{gaugeData.pool.chain}</BoxedData>}
            {gaugeData.market?.chain && <BoxedData>{gaugeData.market.chain}</BoxedData>}
          </Box>
          <Title>{gaugeData.title}</Title>
        </Box>
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
      </Box>
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
          <OpenDataRow>
            <Box flex flexColumn>
              <DataTitle className="open left-aligned">{t`Gauge`}</DataTitle>
              <GaugeData className="open">
                <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.address)}>
                  {shortenTokenAddress(gaugeData.address)}
                  <Icon name="Launch" size={16} />
                </StyledExternalLink>
              </GaugeData>
            </Box>
            {gaugeData.pool?.address && (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Pool`}</DataTitle>
                <GaugeData className="open">
                  <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.pool.address)}>
                    {shortenTokenAddress(gaugeData.pool.address)}
                    <Icon name="Launch" size={16} />
                  </StyledExternalLink>
                </GaugeData>
              </Box>
            )}
            {gaugeData.emissions && (
              <Box flex flexColumn>
                <DataTitle className="open left-aligned">{t`Emissions (CRV)`}</DataTitle>
                <GaugeData className="open">{formatNumber(gaugeData.emissions)}</GaugeData>
              </Box>
            )}
            <Box flex flexColumn>
              <DataTitle className="open left-aligned">{t`Created`}</DataTitle>
              <GaugeData className="open">
                {new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())).toLocaleString()}
              </GaugeData>
            </Box>
          </OpenDataRow>
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

const Title = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  margin: auto 0 0 0.25rem;
`

const BoxColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
  margin: auto 0 auto auto;
`

const BoxedData = styled.p`
  border: 1px solid var(--gray-500);
  padding: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
`

const DataTitle = styled.h4`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
  text-align: right;
  &.left-aligned {
    text-align: left;
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
`

const OpenDataRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-4);
  justify-content: space-between;
  border-top: 1px solid var(--gray-500a20);
  padding-top: var(--spacing-3);
  padding-bottom: var(--spacing-2);
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
