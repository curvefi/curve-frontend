import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import useStore from '@/store/useStore'

import BarChartComponent from '../../Charts/BarChartComponent'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import Box from '@/ui/Box'

const GaugeWeightDistribution = () => {
  const { getGauges, gaugesLoading, gaugeMapper } = useStore((state) => state.gauges)

  const formattedData = useMemo(() => {
    return Object.values(gaugeMapper)
      .filter((gauge) => gauge.gauge_relative_weight > 0.5)
      .sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)
  }, [gaugeMapper])

  return (
    <Wrapper variant="secondary">
      <Box flex flexColumn padding={'var(--spacing-3) 0 0'}>
        <ChartTitle>{t`Relative Weight Distribution`}</ChartTitle>
        {gaugesLoading === 'LOADING' && (
          <StyledSpinnerWrapper>
            <Spinner size={24} />
          </StyledSpinnerWrapper>
        )}
        {gaugesLoading === 'ERROR' && (
          <ErrorMessageWrapper>
            <ErrorMessage message={t`Error fetching gauges`} onClick={() => getGauges(true)} />
          </ErrorMessageWrapper>
        )}
        {gaugesLoading === 'SUCCESS' && <BarChartComponent data={formattedData} />}
      </Box>
      <ChartDescription>{t`Showing gauges with >0.5% relative gauge weight`}</ChartDescription>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-3);
  @media (max-width: 54.6875rem) {
    display: none;
  }
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
  min-width: 100%;
`

const ChartTitle = styled.h4`
  font-weight: var(--bold);
  text-transform: uppercase;
  margin: 0 0 var(--spacing-2);
`

const ChartDescription = styled.p`
  font-size: var(--font-size-1);
  margin-bottom: var(--spacing-3);
`

const ErrorMessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 100%;
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-3);
`

export default GaugeWeightDistribution
