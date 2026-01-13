import { styled } from 'styled-components'
import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { Chain } from '@ui-kit/utils'
import { CurrentVotes } from './CurrentVotes'

export const GaugeVoting = ({ userAddress }: { userAddress: string | undefined }) => {
  const { provider, curveApi: { chainId } = {} } = useCurve()
  if (chainId !== Chain.Ethereum) {
    return <WrongNetwork />
  }
  if (!provider) {
    return <ConnectWalletPrompt description="Connect your wallet to view your current votes and vote on gauges" />
  }
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
