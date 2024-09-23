import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/utils'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import DocumentHead from '@/layout/default/DocumentHead'
import PoolCreation from '@/components/PageCreatePool/index'
import Box from '@/ui/Box'
import ConnectWallet from '@/components/ConnectWallet'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve } = usePageOnMount(params, location, navigate)
  const provider = useStore((state) => state.wallet.getProvider(''))

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Create Pool`} />
      {!provider ? (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWallet
              description="Connect wallet to access pool creation"
              connectText="Connect Wallet"
              loadingText="Connecting"
            />
          </ConnectWalletWrapper>
        </Box>
      ) : (
        <Container>
          <PoolCreation curve={curve as CurveApi} />
        </Container>
      )}
    </>
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
  margin: var(--spacing-5) auto auto;
  background: var(--page--background-color);
  padding: var(--spacing-4) var(--spacing-4);
`

export default Page
