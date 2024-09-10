import styled from 'styled-components'
import { useEffect } from 'react'

import useStore from '@/store/useStore'

import CurrentVotes from './CurrentVotes'

const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const { getUserGaugeVoteWeights, userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const curve = useStore((state) => state.curve)

  useEffect(() => {
    if (userAddress && curve && userGaugeVoteWeightsMapper[userAddress.toLowerCase()] === undefined) {
      getUserGaugeVoteWeights(userAddress)
    }
  }, [getUserGaugeVoteWeights, userAddress, curve, userGaugeVoteWeightsMapper])

  return (
    <Wrapper>
      <CurrentVotes userAddress={userAddress} />
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

export default GaugeVoting
