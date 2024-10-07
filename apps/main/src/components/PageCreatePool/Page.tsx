import Box from '@/ui/Box'
import { breakpoints } from '@/ui/utils/responsive'
import { t } from '@lingui/macro'
import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import ConnectWallet from '@/components/ConnectWallet'
import PoolCreation from '@/components/PageCreatePool/index'
import usePageOnMount from '@/hooks/usePageOnMount'
import DocumentHead from '@/layout/default/DocumentHead'
import useStore from '@/store/useStore'
import { scrollToTop } from '@/utils'


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
  margin: var(--spacing-3) auto;
`

export default Page
