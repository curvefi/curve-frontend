import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/utils'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import Dashboard from '@/components/PageDashboard/index'
import DocumentHead from '@/layout/default/DocumentHead'
import Settings from '@/layout/default/Settings'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ConnectWallet from '@/components/ConnectWallet'
import Box from '@/ui/Box'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve, routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams
  const provider = useStore((state) => state.wallet.getProvider(''))

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Dashboard`} />
      {!provider ? (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWallet
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
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-5) auto auto;
  background: var(--page--background-color);
  padding: var(--spacing-4) var(--spacing-4);
`

export default Page
