import type { AnchorHTMLAttributes } from 'react'
import type { LinkProps } from 'ui/src/Link/styles'

import styled from 'styled-components'
import React from 'react'

import { linkStyles } from 'ui/src/Link/styles'

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {
  isNumber?: boolean
}

const ExternalLink = ({ className, children, ...props }: React.PropsWithChildren<Props>) => {
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
