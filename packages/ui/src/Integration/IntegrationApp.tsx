import type { IntegrationApp, IntegrationsTags } from 'ui/src/Integration/types'

import React from 'react'
import styled, { css } from 'styled-components'

import { breakpoints } from 'ui/src/utils/responsive'

import Box from 'ui/src/Box'
import ExternalLink from 'ui/src/Link/ExternalLink'
import IntegrationAppTag from 'ui/src/Integration/IntegrationAppTag'

const IntegrationAppComp = ({
  appUrl,
  description,
  imageUrl,
  integrationsAppNetworks,
  name,
  tags,
  twitterUrl,
  filterKey,
  integrationsTags,
}: IntegrationApp & {
  filterKey: string
  integrationsAppNetworks: React.ReactNode | null
  integrationsTags: IntegrationsTags
  imageUrl: string | null
}) => {
  const showFilterKeys = filterKey === 'all'
  const haveExternalLinks = !!appUrl || !!twitterUrl

  return (
    <IntegrationAppWrapper>
      <ImgWrapper flex flexAlignItems="center">
        {imageUrl ? <Img src={imageUrl} /> : <ImgPlaceholder />}
      </ImgWrapper>
      <Box
        flex
        flexDirection="column"
        flexJustifyContent={haveExternalLinks ? 'space-between' : 'center'}
        padding="1rem 1rem 1rem 0"
      >
        <IntegrationAppContent haveExternalLinks={haveExternalLinks}>
          <Title>{name}</Title>
          <Description>{description}</Description>
          {integrationsAppNetworks}
          {showFilterKeys && (
            <Box>
              {Object.keys(tags).map((k, idx) => (
                <IntegrationAppTag key={`${k}-${idx}`} integrationTag={integrationsTags[k]} />
              ))}
            </Box>
          )}
        </IntegrationAppContent>

        <Box flex gridGap={2} margin="0.75rem 0 0 0">
          {appUrl && <AppExternalLink href={appUrl}>App</AppExternalLink>}
          {twitterUrl && <AppExternalLink href={twitterUrl}>Twitter</AppExternalLink>}
        </Box>
      </Box>
    </IntegrationAppWrapper>
  )
}

const IntegrationAppWrapper = styled.div`
  color: var(--link_box--color);
  background-color: var(--link_box--background-color);
  border: 1px solid var(--link_box--border-color);
  border-top-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100%;
  text-decoration: none;
  text-transform: initial;
  width: 100%;

  @media (min-width: ${breakpoints.sm}rem) {
    border-top-color: var(--link_box--border-color);
    border-left-color: var(--link_box--border-color);
    border-right-color: var(--link_box--border-color);
  }
`

const ImgWrapper = styled(Box)`
  padding: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: 1.5rem;
  }
`

const imageCSS = css`
  height: auto;
  width: 35px;

  @media (min-width: ${breakpoints.sm}rem) {
    height: auto;
    width: 50px;
  }
`

const Img = styled.img`
  ${imageCSS};
`

const ImgPlaceholder = styled.div`
  ${imageCSS};
`

const IntegrationAppContent = styled.div<{ haveExternalLinks: boolean }>`
  ${({ haveExternalLinks }) => {
    if (haveExternalLinks) {
      return `
        display: flex;
        flex-direction: column;
        justify-content: center;
      `
    }
  }}
`

const Title = styled.strong`
  font-size: var(--font-size-3);
`

const Description = styled.p`
  font-size: var(--font-size-2);
  margin-top: 0.2rem;
`

const AppExternalLink = styled(ExternalLink)`
  border: 1px solid var(--nav_button--border-color);
  color: inherit;
  padding: 0.2rem 0.5rem;
  font-size: var(--font-size-2);
  text-transform: initial;
  text-decoration: none;

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover:not(:disabled) {
    color: var(--button--color);
    border: 1px solid var(--nav_button--border-color);
    background-color: var(--button_filled--hover--background-color);
  }
`

export default IntegrationAppComp
