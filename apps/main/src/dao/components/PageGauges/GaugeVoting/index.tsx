import { useEffect } from 'react'
import styled from 'styled-components'
import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import useStore from '@/dao/store/useStore'
import { isLoading } from '@ui/utils'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import CurrentVotes from './CurrentVotes'

const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const getUserGaugeVoteWeights = useStore((state) => state.user.getUserGaugeVoteWeights)
  const userGaugeVoteWeightsMapper = useStore((state) => state.user.userGaugeVoteWeightsMapper)
  const curve = useApiStore((state) => state.curve)
  const chainId = curve?.chainId
  const { provider } = useWallet()
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)

  useEffect(() => {
    if (userAddress && chainId === 1 && curve && userGaugeVoteWeightsMapper[userAddress.toLowerCase()] === undefined) {
      void getUserGaugeVoteWeights(userAddress)
    }
  }, [getUserGaugeVoteWeights, userAddress, curve, userGaugeVoteWeightsMapper, chainId])

  if (!provider)
    return (
      <ConnectWrapper>
        <ConnectWalletPrompt
          description="Connect your wallet to view your current votes and vote on gauges"
          connectText="Connect Wallet"
          loadingText="Connecting"
          connectWallet={() => connectWallet()}
          isLoading={isLoading(connectState)}
        />
      </ConnectWrapper>
    )

  if (chainId !== 1) return <WrongNetwork />

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
