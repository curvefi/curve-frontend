import styled from 'styled-components'

import useStore from '@/dao/store/useStore'

import Box from '@ui/Box'
import GaugeWeightHistoryChart from '@/dao/components/Charts/GaugeWeightHistoryChart'
import GaugeHeader from './GaugeHeader'
import GaugeMetrics from './GaugeMetrics'
import GaugeVotesTable from './GaugeVotesTable'
import BackButton from '../BackButton'
import type { GaugeUrlParams } from '@/dao/types/dao.types'

type GaugeProps = {
  routerParams: GaugeUrlParams
}

const Gauge = ({ routerParams: { gaugeAddress: rGaugeAddress } }: GaugeProps) => {
  const gaugeAddress = rGaugeAddress.toLowerCase()
  const { gaugeMapper, gaugesLoading } = useStore((state) => state.gauges)

  const tableMinWidth = 21.875
  const gaugeData = gaugeMapper[gaugeAddress]
  const loading = gaugesLoading === 'LOADING'

  return (
    <Wrapper>
      <BackButton path="/ethereum/gauges" label="Back to gauges" />
      <GaugePageContainer variant="secondary">
        <GaugeHeader gaugeData={gaugeData} dataLoading={loading} />
        <GaugeMetrics gaugeData={gaugeData} dataLoading={loading} />
        <Content>
          <GaugeWeightHistoryChart gaugeAddress={gaugeAddress} minHeight={25} />
        </Content>
        <GaugeVotesTable gaugeAddress={gaugeAddress} tableMinWidth={tableMinWidth} />
      </GaugePageContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const GaugePageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  width: 100%;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  width: 100%;
`

export default Gauge
