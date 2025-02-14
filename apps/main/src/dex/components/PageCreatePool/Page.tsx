import type { NextPage } from 'next'
import { t } from '@ui-kit/lib/i18n'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils/responsive'
import { scrollToTop } from '@/dex/utils'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import DocumentHead from '@/dex/layout/default/DocumentHead'
import PoolCreation from '@/dex/components/PageCreatePool/index'
import Box from '@ui/Box'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { CurveApi } from '@/dex/types/main.types'
import useStore from '@/dex/store/useStore'
import { isLoading } from '@ui/utils'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve } = usePageOnMount(params, location, navigate)
  const { provider } = useWallet()
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Create Pool`} />
      {!provider ? (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWalletPrompt
              description="Connect wallet to access pool creation"
              connectText="Connect Wallet"
              loadingText="Connecting"
              connectWallet={() => connectWallet()}
              isLoading={isLoading(connectState)}
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
