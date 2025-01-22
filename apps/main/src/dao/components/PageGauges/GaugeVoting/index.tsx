import styled from 'styled-components'
import { useEffect } from 'react'
import useStore from '@dao/store/useStore'
import CurrentVotes from './CurrentVotes'
import { ConnectWalletPrompt } from '@ui-kit/features/connect-wallet'
import { useWalletStore } from '@ui-kit/features/connect-wallet'
import { isLoading } from '@ui/utils'

const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const { getUserGaugeVoteWeights, userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const curve = useStore((state) => state.curve)
  const provider = useWalletStore((s) => s.provider)
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)

  useEffect(() => {
    if (userAddress && curve && userGaugeVoteWeightsMapper[userAddress.toLowerCase()] === undefined) {
      getUserGaugeVoteWeights(userAddress)
    }
  }, [getUserGaugeVoteWeights, userAddress, curve, userGaugeVoteWeightsMapper])

  return !provider ? (
    <ConnectWrapper>
      <ConnectWalletPrompt
        description="Connect your wallet to view your current votes and vote on gauges"
        connectText="Connect Wallet"
        loadingText="Connecting"
        connectWallet={() => connectWallet()}
        isLoading={isLoading(connectState)}
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
