import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState } from 'react'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
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
  const [showDetails, setShowDetails] = useState(false)
  const { setSelectedGauge } = useStore((state) => state.gauges)

  return (
    <Wrapper showDetails={showDetails}>
      <Box flex flexGap="var(--spacing-2)" flexJustifyContent="space-between" flexAlignItems="center">
        <h5>{t`Vote for new gauge`}</h5>
        <IconButton opacity={1} padding={2} onClick={() => setSelectedGauge(null)}>
          <Icon name="Close" size={24} aria-label="Close" />
        </IconButton>
      </Box>
      <Box grid gridTemplateColumns="1fr 1fr" flexGap="var(--spacing-3)" margin={'0 0 var(--spacing-2) 0'}>
        <TitleComp gaugeData={gaugeData} imageBaseUrl={imageBaseUrl} />
        <VoteGaugeField newVote availablePower={availablePower} userGaugeVoteData={userGaugeVoteData} />
      </Box>
      <Box>
        <StyledIconButton
          showDetails={showDetails}
          opacity={1}
          padding={2}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? t`Hide Gauge Details` : t`Show Gauge Details`}
          <Icon name={showDetails ? 'ChevronUp' : 'ChevronDown'} size={16} aria-label="Close" />
        </StyledIconButton>
        {showDetails && <GaugeDetails gaugeData={gaugeData} />}
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ showDetails: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 var(--spacing-3) ${({ showDetails }) => (showDetails ? 'var(--spacing-3)' : 'var(--spacing-2)')};
`

const StyledIconButton = styled(IconButton)<{ showDetails: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ showDetails }) => (showDetails ? 'var(--spacing-2)' : '0')};
  gap: var(--spacing-1);
  font-weight: var(--semi-bold);
`

export default VoteGauge
