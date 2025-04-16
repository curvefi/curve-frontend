'use client'
import styled from 'styled-components'
import Dashboard from '@/dex/components/PageDashboard/index'
import { usePageProps } from '@/dex/hooks/usePageProps'
import Settings from '@/dex/layout/default/Settings'
import type { CurveApi, NetworkUrlParams } from '@/dex/types/main.types'
import Box from '@ui/Box'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'

const Page = (params: NetworkUrlParams) => {
  const { curve, routerParams, pageLoaded } = usePageProps()
  const { rChainId } = routerParams
  const { provider } = useWallet()
  const { connect: connectWallet } = useWallet()
  const { connectState } = useConnection<CurveApi>()
  return (
    <>
      {!provider ? (
        <Box display="flex" fillWidth flexJustifyContent="center">
          <ConnectWalletWrapper>
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
        <Container>
          {rChainId ? (
            <Dashboard curve={curve} rChainId={rChainId} params={params} pageLoaded={pageLoaded} />
          ) : (
            <SpinnerWrapper minHeight="50vh">
              <Spinner />
            </SpinnerWrapper>
          )}
        </Container>
      )}
      <Settings showScrollButton />
    </>
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

export default Page
