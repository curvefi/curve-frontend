import styled from 'styled-components'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'

type Props = {
  gaugeData: GaugeFormattedData
}

const GaugeListItem = ({ gaugeData }: Props) => {
  return (
    <GaugeBox>
      <Box flex flexColumn>
        <Box flex flexGap={'var(--spacing-1)'}>
          <BoxedData>{gaugeData.network}</BoxedData>
          <BoxedData>{gaugeData.platform}</BoxedData>
        </Box>
        <Title>{gaugeData.title}</Title>
      </Box>
      <Box flex flexColumn flexJustifyContent="center" flexGap={'var(--spacing-1)'} margin={'auto 0 auto auto'}>
        <DataTitle>{t`Weight`}</DataTitle>
        <GaugeData>{gaugeData.gauge_relative_weight.toFixed(2)}%</GaugeData>
      </Box>
      <Divider />
      <Box flex flexColumn flexJustifyContent="center" flexGap={'var(--spacing-1)'}>
        <DataTitle>{t`7d Delta`}</DataTitle>
        <GaugeData
          className={`${
            gaugeData.gauge_weight_7d_delta ? (gaugeData.gauge_weight_7d_delta > 0 ? 'green' : 'red') : ''
          }`}
        >
          {gaugeData.gauge_weight_7d_delta ? `${gaugeData.gauge_weight_7d_delta.toFixed(2)}%` : 'N/A'}
        </GaugeData>
      </Box>
      <Divider />
      <Box flex flexColumn flexJustifyContent="center" flexGap={'var(--spacing-1)'}>
        <DataTitle>{t`60d Delta`}</DataTitle>
        <GaugeData
          className={`${
            gaugeData.gauge_weight_60d_delta ? (gaugeData.gauge_weight_60d_delta > 0 ? 'green' : 'red') : null
          }`}
        >
          {gaugeData.gauge_weight_60d_delta ? `${gaugeData.gauge_weight_60d_delta.toFixed(2)}%` : 'N/A'}
        </GaugeData>
      </Box>
      {/* <Divider />
      <Box flex flexColumn flexJustifyContent="center" flexGap={'var(--spacing-1)'}>
        <DataTitle>{t`Emissions`}</DataTitle>
        <GaugeData>{gaugeData.emissions.toFixed(0)}</GaugeData>
      </Box> */}
    </GaugeBox>
  )
}

const GaugeBox = styled.div`
  display: grid;
  grid-template-columns: 2fr 0.8fr 2px 0.8fr 2px 0.8fr;
  padding: var(--spacing-2);
  gap: var(--spacing-1);
  background-color: var(--summary_content--background-color);
`

const Title = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  margin-left: 0.25rem;
  margin-top: 0.25rem;
`

const BoxedData = styled.p`
  background-color: var(--blacka05);
  padding: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.8;
  text-transform: capitalize;
`

const DataTitle = styled.h4`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
  text-align: right;
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
`

const Divider = styled.div`
  margin: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--blacka05);
`

export default GaugeListItem
