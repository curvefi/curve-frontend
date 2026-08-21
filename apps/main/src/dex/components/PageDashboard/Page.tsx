import { styled } from 'styled-components'
import { Dashboard } from '@/dex/components/PageDashboard/index'
import { useChainId } from '@/dex/hooks/useChainId'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { ConnectWalletPrompt, isLoading, useCurve, useWallet } from '@evm-ui/features/connect-wallet'
import { useParams } from '@evm-ui/hooks/router'
import { SpinnerWrapper, Spinner } from '@legacy-ui/Spinner'
import { breakpoints } from '@legacy-ui/utils/responsive'

export const PageDashboard = () => {
  const props = useParams<NetworkUrlParams>()
  const { curveApi = null, connectState } = useCurve()
  const rChainId = useChainId(props.network)
  const { provider } = useWallet()
  return provider ? (
    <Container data-testid="dashboard-page">
      {rChainId ? (
        <Dashboard curve={curveApi} rChainId={rChainId} params={props} pageLoaded={!isLoading(connectState)} />
      ) : (
        <SpinnerWrapper minHeight="50vh">
          <Spinner />
        </SpinnerWrapper>
      )}
    </Container>
  ) : (
    <ConnectWalletPrompt description="Connect wallet to view dashboard" testId="dashboard-page" />
  )
}

const Container = styled.div`
  background-color: var(--table--background-color);
  min-height: 50vh;

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`
