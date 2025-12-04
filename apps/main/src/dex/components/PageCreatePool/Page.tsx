import { styled } from 'styled-components'
import PoolCreation from '@/dex/components/PageCreatePool/index'
import Box from '@ui/Box'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useWagmiConnection as useWagmiConnection } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'

export const PageCreatePool = () => {
  const { curveApi = null, connectState } = useConnection()
  const { connect: connectWallet } = useWallet()
  const { address } = useWagmiConnection()

  if (address && curveApi) {
    return (
      <Container data-testid="create-pool-page">
        <PoolCreation curve={curveApi} />
      </Container>
    )
  }
  return (
    <Box display="flex" fillWidth>
      <ConnectWalletWrapper data-testid="create-pool-page">
        <ConnectWalletPrompt
          description="Connect wallet to access pool creation"
          connectText="Connect Wallet"
          loadingText="Connecting"
          connectWallet={() => connectWallet()}
          isLoading={isLoading(connectState)}
        />
      </ConnectWalletWrapper>
    </Box>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;

  @media (min-width: 46.875rem) {
    margin: 1.5rem 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`
