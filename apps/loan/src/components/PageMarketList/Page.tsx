import Box from '@/ui/Box'
import { breakpoints } from '@/ui/utils/responsive'
import { t } from '@lingui/macro'
import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import ConnectWallet from '@/components/ConnectWallet'
import TableStats from '@/components/PageMarketList/components/TableStats'
import CollateralList from '@/components/PageMarketList/index'
import usePageOnMount from '@/hooks/usePageOnMount'
import DocumentHead from '@/layout/DocumentHead'
import Settings from '@/layout/Settings'
import useStore from '@/store/useStore'
import { scrollToTop } from '@/utils/helpers'


const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, routerParams, curve } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams
  const provider = useStore((state) => state.wallet.getProvider(''))

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Markets`} />
      {provider ? (
        <Container>
          <Content>
            {rChainId && <CollateralList pageLoaded={pageLoaded} params={params} rChainId={rChainId} curve={curve} />}
          </Content>
          {rChainId && <TableStats />}
        </Container>
      ) : (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWallet
              description="Connect wallet to view markets list"
              connectText="Connect Wallet"
              loadingText="Connecting"
            />
          </ConnectWalletWrapper>
        </Box>
      )}
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;
  padding-top: 0.5rem; // 8px

  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: 2rem;
    padding-left: var(--spacing-narrow);
    padding-right: var(--spacing-narrow);
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin-top: 3rem;
  }
`

const Content = styled.div`
  background-color: var(--table--background-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
  border: 1px solid var(--box--secondary--border);
  min-height: 288px;
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`

export default Page
