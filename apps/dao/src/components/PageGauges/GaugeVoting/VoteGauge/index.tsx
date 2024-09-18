import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import VoteGaugeField from '../VoteGaugeField'
import TitleComp from '../../GaugeListItem/TitleComp'
import GaugeDetails from '../../GaugeListItem/GaugeDetails'

type VoteGaugeProps = {
  imageBaseUrl: string
  gaugeData: GaugeFormattedData
  userGaugeVoteData: UserGaugeVoteWeight
  availablePower: number
}

const VoteGauge: React.FC<VoteGaugeProps> = ({ imageBaseUrl, gaugeData, userGaugeVoteData, availablePower }) => {
  const { setSelectedGauge } = useStore((state) => state.gauges)

  return (
    <Wrapper>
      <Box flex flexGap="var(--spacing-2)" flexJustifyContent="space-between" flexAlignItems="center">
        <h5>{t`Vote for new gauge`}</h5>
        <IconButton testId="search-close" opacity={1} padding={2} onClick={() => setSelectedGauge(null)}>
          <Icon name="Close" size={24} aria-label="Close" />
        </IconButton>
      </Box>
      <Box grid gridTemplateColumns="1fr 1fr" flexGap="var(--spacing-3)" margin={'0 0 var(--spacing-3) 0'}>
        <TitleComp gaugeData={gaugeData} imageBaseUrl={imageBaseUrl} />
        <VoteGaugeField newVote availablePower={availablePower} userGaugeVoteData={userGaugeVoteData} />
      </Box>
      <GaugeDetails gaugeData={gaugeData} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 var(--spacing-3) var(--spacing-3);
`

export default VoteGauge
