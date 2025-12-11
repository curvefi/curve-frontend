import { styled } from 'styled-components'
import Dashboard from '@/dex/components/PageDashboard/index'
import { useChainId } from '@/dex/hooks/useChainId'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Box from '@ui/Box'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useCurve, useWallet } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'

export const PageDashboard = () => {
  const props = useParams<NetworkUrlParams>()
  const { curveApi = null, connectState } = useCurve()
  const rChainId = useChainId(props.network)
  const { provider, connect: connectWallet } = useWallet()
  return !provider ? (
    <Box display="flex" fillWidth flexJustifyContent="center">
      <ConnectWalletWrapper data-testid="dashboard-page">
        <ConnectWalletPrompt
          description="Connect wallet to view dashboard"
          connectText="Connect Wallet"
          loadingText="Connecting"
          connectWallet={() => connectWallet()}
          isLoading={isLoading(connectState)}
        />
      </ConnectWalletWrapper>
    </Box>
  ) : (
    <Container data-testid="dashboard-page">
      {rChainId ? (
        <Dashboard curve={curveApi} rChainId={rChainId} params={props} pageLoaded={!isLoading(connectState)} />
      ) : (
        <SpinnerWrapper minHeight="50vh">
          <Spinner />
        </SpinnerWrapper>
      )}
    </Container>
  )
}

const Container = styled.div`
  background-color: var(--table--background-color);
  min-height: 50vh;

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  margin: var(--spacing-3) auto;
`
