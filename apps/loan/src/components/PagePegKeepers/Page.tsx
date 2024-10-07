import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'

import DocumentHead from '@/layout/DocumentHead'
import ExternalLink from '@/ui/Link/ExternalLink'
import Settings from '@/layout/Settings'
import PagePegKeepers from '@/components/PagePegKeepers'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`PegKeepers`} />
      <Container>
        <ContainerContent>
          <Title>{t`Peg Keepers`}</Title>
          <Description>
            <StyledExternalLink href="https://resources.curve.fi/crvusd/faq/#peg-keepers">
              Click here
            </StyledExternalLink>{' '}
            to learn more about Peg Keepers.
          </Description>
          {rChainId && <PagePegKeepers rChainId={rChainId} />}
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

export default Page
