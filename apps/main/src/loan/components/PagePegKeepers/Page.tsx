import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import { scrollToTop } from '@loan/utils/helpers'
import usePageOnMount from '@loan/hooks/usePageOnMount'
import useStore from '@loan/store/useStore'

import Box from '@ui/Box'
import { ConnectWalletPrompt as ConnectWallet } from '@ui-kit/features/connect-wallet'
import DocumentHead from '@loan/layout/DocumentHead'
import ExternalLink from '@ui/Link/ExternalLink'
import Settings from '@loan/layout/Settings'
import PagePegKeepers from '@loan/components/PagePegKeepers'
import { useWalletStore } from '@ui-kit/features/connect-wallet/store'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  const provider = useWalletStore((s) => s.provider)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`PegKeepers`} />
      <Container>
        <ContainerContent>
          {rChainId && provider ? (
            <>
              <Title>{t`Peg Keepers`}</Title>
              <Description>
                <StyledExternalLink href="https://resources.curve.fi/crvusd/faq/#peg-keepers">
                  Click here
                </StyledExternalLink>{' '}
                to learn more about Peg Keepers.
              </Description>
              <PagePegKeepers rChainId={rChainId} provider={provider} />
            </>
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
        </ContainerContent>
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);
  margin: 0 auto;
  max-width: var(--width);
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: var(--spacing-normal);
    padding: var(--spacing-normal);
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin-top: var(--spacing-wide);
  }
`

const ContainerContent = styled.div`
  margin: 0 auto;
  padding-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-normal);
  }
`

const Description = styled.p`
  margin-bottom: var(--spacing-wide);
`

const Title = styled.h1`
  font-size: var(--font-size-5);
  margin-bottom: var(--spacing-narrow);
  text-transform: uppercase;

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: var(--font-size-7);
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-transform: initial;
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`

export default Page
