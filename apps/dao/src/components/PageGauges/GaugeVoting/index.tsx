import styled from 'styled-components'
import { useEffect } from 'react'

import useStore from '@/store/useStore'

import CurrentVotes from './CurrentVotes'
import UserBox from '@/components//UserBox'

const GaugeVoting = () => {
  const { getUserGaugeVoteWeights, userAddress, userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const curve = useStore((state) => state.curve)

  useEffect(() => {
    if (userAddress && curve && userGaugeVoteWeightsMapper[userAddress.toLowerCase()] === undefined) {
      getUserGaugeVoteWeights(userAddress)
    }
  }, [getUserGaugeVoteWeights, userAddress, curve, userGaugeVoteWeightsMapper])

  return (
    <Wrapper>
      <StyledUserBox snapshotVotingPower={false} />
      <CurrentVotes userAddress={userAddress ?? ''} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
  min-height: 100%;
`

const StyledUserBox = styled(UserBox)`
  border-bottom: 1px solid var(--gray-500a20);
`

export default GaugeVoting
