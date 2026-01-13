import React, { type AnchorHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import { Link as RouterLink } from '@tanstack/react-router'
import type { LinkProps } from './styles'
import { linkStyles } from './styles'

export interface InternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {}

export const InternalLink = ({ children, href = '', ...props }: InternalLinkProps) => (
  <StyledLink {...props} to={href}>
    {children}
  </StyledLink>
)

const StyledLink = styled(RouterLink)`
  ${linkStyles}
`
