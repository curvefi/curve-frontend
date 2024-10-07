import type { AnchorHTMLAttributes } from 'react'
import type { LinkProps } from 'ui/src/Link/styles'

import styled from 'styled-components'
import React from 'react'

import { linkStyles } from 'ui/src/Link/styles'

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {
  isNumber?: boolean
}

function ExternalLink({ className, children, ...props }: React.PropsWithChildren<ExternalLinkProps>) {
  return (
    <StyledLink target="_blank" {...props} className={className} rel="noreferrer noopener">
      {children}
    </StyledLink>
  )
}

const StyledLink = styled.a`
  ${linkStyles}
`

export default ExternalLink
