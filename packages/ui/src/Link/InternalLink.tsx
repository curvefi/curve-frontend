import RouterLink from 'next/link'
import React, { type AnchorHTMLAttributes } from 'react'
import styled from 'styled-components'
import type { LinkProps } from './styles'
import { linkStyles } from './styles'

export interface InternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {}

const InternalLink = ({ children, href = '', ...props }: InternalLinkProps) => (
  <StyledLink {...props} href={href}>
    {children}
  </StyledLink>
)

const StyledLink = styled(RouterLink)`
  ${linkStyles}
`

export default InternalLink
