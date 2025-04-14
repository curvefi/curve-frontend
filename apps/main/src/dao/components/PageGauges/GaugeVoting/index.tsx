import styled from 'styled-components'
import useStore from '@/dao/store/useStore'
import { isLoading } from '@ui/utils'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import CurrentVotes from './CurrentVotes'

const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const { provider } = useWallet()
  const connectWallet = useStore((state) => state.updateConnectState)
  const connectState = useStore((state) => state.connectState)

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
