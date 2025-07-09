import React, { type AnchorHTMLAttributes } from 'react'
import { Link as RouterLink } from '@tanstack/react-router'
import { styled } from 'styled-components'
import type { LinkProps } from './styles'
import { linkStyles } from './styles'

export interface InternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {}

const InternalLink = ({ children, href = '', ...props }: InternalLinkProps) => (
  <StyledLink {...props} to={href}>
    {children}
  </StyledLink>
)

const StyledLink = styled(RouterLink)`
  ${linkStyles}
`

export default InternalLink
