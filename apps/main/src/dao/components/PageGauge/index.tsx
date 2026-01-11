import { styled } from 'styled-components'
import { GaugeWeightHistoryChart } from '@/dao/components/Charts/GaugeWeightHistoryChart'
import { useGauges } from '@/dao/queries/gauges.query'
import type { GaugeUrlParams } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { Box } from '@ui/Box'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { BackButton } from '../BackButton'
import { GaugeHeader } from './GaugeHeader'
import { GaugeMetrics } from './GaugeMetrics'
import { GaugeVotesTable } from './GaugeVotesTable'

type GaugeProps = {
  routerParams: GaugeUrlParams
}

export const Gauge = ({ routerParams: { gaugeAddress: rGaugeAddress } }: GaugeProps) => {
  const gaugeAddress = rGaugeAddress.toLowerCase()
  const { data: gauges, isLoading: isLoadingGauges } = useGauges({})
  const gaugeData = gauges?.[gaugeAddress]

  const tableMinWidth = 21.875

  return (
    <Wrapper>
      <BackButton path={getEthPath(DAO_ROUTES.PAGE_GAUGES)} label="Back to gauges" />
      <GaugePageContainer variant="secondary">
        <GaugeHeader gaugeData={gaugeData} dataLoading={isLoadingGauges} />
        <GaugeMetrics gaugeData={gaugeData} dataLoading={isLoadingGauges} />
        <Content>{gaugeData && <GaugeWeightHistoryChart gaugeAddress={gaugeData.address} minHeight={25} />}</Content>
        {gaugeData && <GaugeVotesTable gaugeAddress={gaugeData.address} tableMinWidth={tableMinWidth} />}
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
