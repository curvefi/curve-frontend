import React, { type AnchorHTMLAttributes } from 'react'
import type { LinkProps } from './styles'
import { linkStyles } from './styles'
import styled from 'styled-components'
import RouterLink from 'next/link'

export interface InternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkProps {}

const InternalLink = ({ children, href = '', ...props }: React.PropsWithChildren<InternalLinkProps>) => (
  <StyledLink {...props} href={href}>
    {children}
  </StyledLink>
)

const StyledLink = styled(RouterLink)`
  ${linkStyles}
`

export default InternalLink
