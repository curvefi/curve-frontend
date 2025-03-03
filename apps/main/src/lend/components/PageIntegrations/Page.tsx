'use client'
import { t, Trans } from '@ui-kit/lib/i18n'
import { useEffect } from 'react'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils/responsive'
import usePageOnMount from '@/lend/hooks/usePageOnMount'
import useStore from '@/lend/store/useStore'
import { ExternalLink } from '@ui/Link'
import DocumentHead from '@/lend/layout/DocumentHead'
import IntegrationsComp from '@/lend/components/PageIntegrations/index'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { useSearchParams } from 'next/navigation'

const Page = (params: NetworkUrlParams) => {
  const searchParams = useSearchParams()
  const { routerParams } = usePageOnMount(true)
  const { rChainId } = routerParams

  const init = useStore((state) => state.integrations.init)
  const integrationsTags = useStore((state) => state.integrations.integrationsTags)

  useEffect(() => {
    init(rChainId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <DocumentHead title={t`Integrations`} />
      <Container>
        <ContainerContent>
          <Title>Curve Integrations</Title>
          <Subtitle>
            <Trans>
              The following application all allege they are building atop the Curve ecosystem. Please note that no
              guarantee is made as to the authenticity, veracity or safety of any of these protocols. You assume all
              risks for using any links, so please conduct your own research and exercise caution. If you observe any
              issues with any link or would like to add to this list, please create a PR in the following Github
              repository{' '}
              <ExternalLink $noStyles href="https://github.com/curvefi/curve-external-integrations">
                https://github.com/curvefi/curve-external-integrations
              </ExternalLink>
              .
            </Trans>
          </Subtitle>
          {integrationsTags !== null ? (
            <IntegrationsComp
              rChainId={rChainId}
              params={params}
              searchParams={searchParams}
              integrationsTags={integrationsTags}
            />
          ) : (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          )}
        </ContainerContent>
      </Container>
    </>
  )
}

const Container = styled.div`
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

const ContainerContent = styled.div`
  margin: 0 auto;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-left: 2rem;
    margin-right: 2rem;
  }
`

const Title = styled.h1`
  display: inline-block;
  font-size: var(--font-size-5);
  margin: 2.25rem 1rem 1rem 0;
  padding-left: 1rem;
  text-transform: uppercase;

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: var(--font-size-7);
    padding-left: 0;
  }
`

const Subtitle = styled.p`
  margin-left: 1rem;
  margin-right: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-left: 0;
    margin-right: 0;
  }
`

export default Page
