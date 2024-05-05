import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState } from 'react'

import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'
import { formatNumber, shortenTokenAddress, formatNumberWithSuffix } from '@/ui/utils'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'

type Props = {
  gaugeData: GaugeFormattedData
}

const GaugeListItem = ({ gaugeData }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <GaugeBox onClick={() => setOpen(!open)}>
      <Box grid gridTemplateColumns="2fr 0.7fr 0.7fr 0.7fr 0.3fr">
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <Box flex flexGap={'var(--spacing-1)'}>
            <BoxedData>{gaugeData.platform}</BoxedData>
            <BoxedData>{gaugeData.gauge_type}</BoxedData>
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
          <Box flex flexColumn margin={'0 0 0 auto'}>
            <DataTitle className="open">{t`Created`}</DataTitle>
            <GaugeData className="open">
              {new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())).toLocaleString()}
            </GaugeData>
          </Box>
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
  margin-left: 0.25rem;
  margin-top: 0.25rem;
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
  /* opacity: 0.8; */
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
  font-size: var(--font-size-3);
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
  flex-direction: row;
  gap: var(--spacing-5);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-1) 0;
  border-top: 1px solid var(--gray-500a20);
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

export default GaugeListItem
