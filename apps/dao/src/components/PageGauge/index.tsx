import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect } from 'react'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import GaugeWeightHistoryChart from '@/components/Charts/GaugeWeightHistoryChart'
import GaugeHeader from './GaugeHeader'
import GaugeStats from './GaugeStats'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

type GaugeProps = {
  routerParams: {
    rGaugeAddress: string
  }
}

const Gauge = ({ routerParams: { rGaugeAddress } }: GaugeProps) => {
  const gaugeAddress = rGaugeAddress.toLowerCase()
  const { gaugeMapper, gaugesLoading } = useStore((state) => state.gauges)
  const gaugeData = gaugeMapper[gaugeAddress]

  console.log('gaugeMapper', gaugeMapper)

  const loading = gaugesLoading === 'LOADING'
  const error = gaugesLoading === 'ERROR'
  const success = gaugesLoading === 'SUCCESS'

  return (
    <Wrapper>
      <PageTitle>{t`Gauge`}</PageTitle>
      <GaugePageContainer variant="secondary">
        <GaugeHeader gaugeAddress={gaugeAddress} />
        <GaugeStats gaugeData={gaugeData} dataLoading={loading} />
        <Content>
          <GaugeWeightHistoryChart gaugeAddress={gaugeAddress} minHeight={25} />
        </Content>
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

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
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

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
  min-width: 100%;
`

export default Gauge
