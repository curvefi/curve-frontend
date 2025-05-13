'use client'
import styled from 'styled-components'
import PagePegKeepers from '@/loan/components/PagePegKeepers'
import Settings from '@/loan/layout/Settings'
import { useStablecoinConnection } from '@/loan/temp-lib'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useChainId } from '@/loan/utils/utilsRouter'
import Box from '@ui/Box'
import ExternalLink from '@ui/Link/ExternalLink'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const Page = (params: NetworkUrlParams) => {
  const { connectState } = useStablecoinConnection()
  const rChainId = useChainId(params)
  const { connect: connectWallet, provider } = useWallet()

  return (
    <>
      <Container>
        <ContainerContent>
          {rChainId && provider ? (
            <>
              <Title>{t`Peg Keepers`}</Title>
              <Description>
                <StyledExternalLink href="https://resources.curve.finance/crvusd/faq/#peg-keepers">
                  Click here
                </StyledExternalLink>{' '}
                to learn more about Peg Keepers.
              </Description>
              <PagePegKeepers rChainId={rChainId} provider={provider} />
            </>
          ) : (
            <Box display="flex" fillWidth>
              <ConnectWalletWrapper>
                <ConnectWalletPrompt
                  description="Connect wallet to view markets list"
                  connectText="Connect Wallet"
                  loadingText="Connecting"
                  connectWallet={() => connectWallet()}
                  isLoading={isLoading(connectState)}
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
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`

export default Page
