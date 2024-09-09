import styled from 'styled-components'
import { useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import CurrentVotes from './CurrentVotes'

const GaugeVoting = () => {
  const { getUserGaugeVoteWeights, userAddress, userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const userData = useStore((state) => state.user.userGaugeVoteWeightsMapper[userAddress?.toLowerCase() ?? ''])
  const curve = useStore((state) => state.curve)

  useEffect(() => {
    if (userAddress && curve && userGaugeVoteWeightsMapper[userAddress.toLowerCase()] === undefined) {
      getUserGaugeVoteWeights(userAddress)
    }
  }, [getUserGaugeVoteWeights, userAddress, curve, userGaugeVoteWeightsMapper])

  // console.log(userGaugeVoteWeightsMapper)
  // console.log(userData)

  return (
    <Wrapper>
      {userData && userData.fetchingState === 'LOADING' && (
        <StyledSpinnerWrapper vSpacing={5}>
          <Spinner size={24} />
        </StyledSpinnerWrapper>
      )}
      {userData && userData.fetchingState === 'ERROR' && (
        <ErrorMessageWrapper>
          <ErrorMessage message={t`Error fetching gauges`} onClick={() => getUserGaugeVoteWeights(userAddress ?? '')} />
        </ErrorMessageWrapper>
      )}
      {userData && userData.fetchingState === 'SUCCESS' && <CurrentVotes userAddress={userAddress ?? ''} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 100%;
  flex-grow: 1;
  min-height: 100%;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
  min-width: 100%;
`

const ErrorMessageWrapper = styled.div`
  width: 100%;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5) 0;
  @media (min-width: 25rem) {
    padding: var(--spacing-5) var(--spacing-3);
  }
`

export default GaugeVoting
