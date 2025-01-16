import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/dex/utils'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import useStore from '@/dex/store/useStore'

import Dashboard from '@/dex/components/PageDashboard/index'
import DocumentHead from '@/dex/layout/default/DocumentHead'
import Settings from '@/dex/layout/default/Settings'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ConnectWallet from '@/dex/components/ConnectWallet'
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
        <Box display="flex" fillWidth flexJustifyContent="center">
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
  margin: var(--spacing-3) auto;
`

export default Page
