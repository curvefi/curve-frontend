import { useEffect } from 'react'
import styled from 'styled-components'
import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import useStore from '@/dao/store/useStore'
import type { CurveApi } from '@/dao/types/dao.types'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import CurrentVotes from './CurrentVotes'

const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const getUserGaugeVoteWeights = useStore((state) => state.user.getUserGaugeVoteWeights)
  const userGaugeVoteWeightsMapper = useStore((state) => state.user.userGaugeVoteWeightsMapper)
  const { lib: curve } = useConnection<CurveApi>()
  const chainId = curve?.chainId
  const { provider, connect } = useWallet()
  const { connectState } = useConnection()

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
          connectWallet={() => connect()}
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
