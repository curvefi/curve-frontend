import styled from 'styled-components'

import useStore from '@/store/useStore'

import { formatNumber } from '@/ui/utils'

import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import GaugeVoteItem from './GaugeVoteItem'
import Box from '@/ui/Box'

const CurrentVotes = ({ userAddress }: { userAddress: string }) => {
  const userData = useStore((state) => state.user.userGaugeVoteWeightsMapper[userAddress?.toLowerCase() ?? ''])

  return (
    <Wrapper>
      <Box flex flexColumn flexGap="var(--spacing-2)">
        <h3>Current Gauge Votes</h3>
        <Box flex flexGap="var(--spacing-3)">
          <MetricsComp
            loading={userData?.fetchingState === 'LOADING'}
            title="Power used"
            data={<MetricsColumnData>{userData?.data.powerUsed}%</MetricsColumnData>}
          />
          <MetricsComp
            loading={userData?.fetchingState === 'LOADING'}
            title="veCRV used"
            data={
              <MetricsColumnData>
                {formatNumber(userData?.data.veCrvUsed, { showDecimalIfSmallNumberOnly: true })} veCRV
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={userData?.fetchingState === 'LOADING'}
            title="Gauge amount"
            data={<MetricsColumnData>{userData?.data.gauges.length}</MetricsColumnData>}
          />
        </Box>
      </Box>
      {userData &&
        userData.fetchingState === 'SUCCESS' &&
        userData.data.gauges.map((gauge, index) => <GaugeVoteItem key={index} gauge={gauge} />)}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  gap: var(--spacing-3);
`

export default CurrentVotes
