import styled from 'styled-components'
import { useEffect } from 'react'

import useStore from '@/dao/store/useStore'

import CurrentVotes from './CurrentVotes'
import ConnectWallet from '@/dao/components/ConnectWallet'

const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const { getUserGaugeVoteWeights, userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const curve = useStore((state) => state.curve)
  const provider = useStore((state) => state.wallet.getProvider(''))

  useEffect(() => {
    if (userAddress && curve && userGaugeVoteWeightsMapper[userAddress.toLowerCase()] === undefined) {
      getUserGaugeVoteWeights(userAddress)
    }
  }, [getUserGaugeVoteWeights, userAddress, curve, userGaugeVoteWeightsMapper])

  return !provider ? (
    <ConnectWrapper>
      <ConnectWallet
        description="Connect your wallet to view your current votes and vote on gauges"
        connectText="Connect Wallet"
        loadingText="Connecting"
      />
    </ConnectWrapper>
  ) : (
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

const ConnectWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-grow: 1;
  min-height: 100%;
  background-color: var(--table--background-color);
  justify-content: center;
  align-items: center;
`

export default GaugeVoting
