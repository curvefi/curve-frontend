import styled from 'styled-components'
import { useEffect } from 'react'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import PieChartComponent from './components/PieChartComponent'
import UserBox from '../UserBox'

const Gauges = () => {
  const { getGauges, gaugeMapper, gaugesLoading, pieData } = useStore((state) => state.gauges)
  const curve = useStore((state) => state.curve)

  useEffect(() => {
    if (curve) {
      getGauges(curve)
    }
  }, [curve, getGauges])
  return (
    <Wrapper>
      <ProposalsContainer variant="secondary">
        <Box flex>
          {gaugesLoading ? '' : <PieChartComponent data={pieData} />}
          <UserBox />
        </Box>
      </ProposalsContainer>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-5) auto 0;
  width: 60rem;
  flex-grow: 1;
  min-height: 100%;
`

const ProposalsContainer = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-7);
  row-gap: var(--spacing-3);
`

export default Gauges
