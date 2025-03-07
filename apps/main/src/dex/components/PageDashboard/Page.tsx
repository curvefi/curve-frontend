'use client'
import styled from 'styled-components'
import Dashboard from '@/dex/components/PageDashboard/index'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import Settings from '@/dex/layout/default/Settings'
import useStore from '@/dex/store/useStore'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Box from '@ui/Box'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { isLoading } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'

const Page = (params: NetworkUrlParams) => {
  const { curve, routerParams } = usePageOnMount()
  const { rChainId } = routerParams
  const { provider } = useWallet()
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)
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
            <Dashboard curve={curve} rChainId={rChainId} params={params} />
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
