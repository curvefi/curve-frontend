import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState } from 'react'

import useStore from '@dao/store/useStore'

import Box from '@ui/Box'
import IconButton from '@ui/IconButton'
import Icon from '@ui/Icon'
import VoteGaugeField from '../VoteGaugeField'
import TitleComp from '../../GaugeListItem/TitleComp'
import GaugeDetails from '../../GaugeListItem/GaugeDetails'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@dao/types/dao.types'

type VoteGaugeProps = {
  imageBaseUrl: string
  gaugeData: GaugeFormattedData
  userGaugeVoteData: UserGaugeVoteWeight
  powerUsed: number
}

const VoteGauge: React.FC<VoteGaugeProps> = ({ imageBaseUrl, gaugeData, userGaugeVoteData, powerUsed }) => {
  const [showDetails, setShowDetails] = useState(false)
  const { setSelectedGauge } = useStore((state) => state.gauges)
  const { veCrv } = useStore((state) => state.user.userVeCrv)

  return (
    <Wrapper showDetails={showDetails}>
      <TitleWrapper>
        <h5>{t`Vote for new gauge`}</h5>
        <IconButton opacity={1} padding={2} onClick={() => setSelectedGauge(null)}>
          <Icon name="Close" size={24} aria-label="Close" />
        </IconButton>
      </TitleWrapper>
      <MainWrapper>
        <TitleComp gaugeData={gaugeData} imageBaseUrl={imageBaseUrl} />
        <VoteGaugeField newVote powerUsed={powerUsed} userVeCrv={+veCrv} userGaugeVoteData={userGaugeVoteData} />
      </MainWrapper>
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
  @media (max-width: 42.375rem) {
    border-bottom: 1px solid var(--gray-500a20);
  }
`

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  @media (min-width: 48.4375rem) {
    margin-bottom: 0;
  }
`

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin: 0 0 var(--spacing-2) 0;
  @media (min-width: 48.4375rem) {
    display: grid;
    gap: var(--spacing-3);
    grid-template-columns: 1fr 1fr;
  }
`

const StyledIconButton = styled(IconButton)<{ showDetails: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0 auto;
  gap: var(--spacing-1);
  font-weight: var(--bold);
  @media (min-width: 48.4375rem) {
    margin: 0 0 0 auto;
  }
`

export default VoteGauge
