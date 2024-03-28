import React from 'react'
import { breakpoints } from '@/ui/utils'
import styled from 'styled-components'

import Chip from '@/ui/Typography/Chip'
import ExternalLink from '@/ui/Link/ExternalLink'
import Icon from '@/ui/Icon'

const PoolAlertCustomMessage = ({
  className = '',
  title,
  titleIcon,
  externalLinks,
}: {
  className?: string
  title: string
  titleIcon: React.ReactElement
  externalLinks: { label: string; url: string }[]
}) => {
  return (
    <MessageWrapper className={className} $isManyLinks={externalLinks.length > 2}>
      <Title>
        <CustomIconWrapper>{titleIcon}</CustomIconWrapper>
        {title}
      </Title>{' '}
      <MessageLinksWrapper>
        {externalLinks.map(({ label, url }) => {
          return (
            <React.Fragment key={url}>
              <StyledChip isBold>
                <StyledExternalLink href={url}>
                  {label} <Icon className="svg-tooltip" name="Launch" size={16} />
                </StyledExternalLink>
              </StyledChip>{' '}
            </React.Fragment>
          )
        })}
      </MessageLinksWrapper>
    </MessageWrapper>
  )
}

const MessageWrapper = styled.div<{ $isManyLinks: boolean }>`
  display: flex;

  ${({ $isManyLinks }) => {
    if ($isManyLinks) {
      return `
        align-items: flex-start;
        flex-direction: column;
        grid-gap: var(--spacing-1);
      `
    }
  }}
`

const MessageLinksWrapper = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
    white-space: nowrap;
  }
`

const CustomIconWrapper = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 0.2rem;
`

const Title = styled.div`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  justify-content: flex-start;
  font-size: var(--font-size-3);
  font-weight: bold;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-transform: initial;
`

const StyledChip = styled(Chip)`
  display: inline-block;
  opacity: 0.75;
  background-color: hsl(0deg 0% 50% / 10%);
  padding: 0.2rem 0.5rem 0.4rem;
  margin: 0.25rem 0.25rem 0 0;

  :hover {
    opacity: 1;
  }

  ${StyledExternalLink} {
    font-size: var(--font-size-1);
    text-decoration: none;
    text-transform: uppercase;

    :hover {
      color: inherit;
      text-transform: uppercase;
    }
  }

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 0 0.2rem;
  }
`

export default PoolAlertCustomMessage
