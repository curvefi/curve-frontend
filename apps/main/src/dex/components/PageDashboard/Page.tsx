import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import { scrollToTop } from '@main/utils'
import usePageOnMount from '@main/hooks/usePageOnMount'

import Dashboard from '@main/components/PageDashboard/index'
import DocumentHead from '@main/layout/default/DocumentHead'
import Settings from '@main/layout/default/Settings'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { ConnectWalletPrompt } from '@ui-kit/features/connect-wallet'
import Box from '@ui/Box'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve, routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams
  const provider = useWalletStore((s) => s.provider)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Dashboard`} />
      {!provider ? (
        <Box display="flex" fillWidth flexJustifyContent="center">
          <ConnectWalletWrapper>
            <ConnectWalletPrompt
              description="Connect wallet to view dashboard"
              connectText="Connect Wallet"
              loadingText="Connecting"
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
